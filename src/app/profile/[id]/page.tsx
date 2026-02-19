"use client";
import { SidebarDemo } from "@/components/sidebardemo";
import { useState, useEffect, use } from "react";
import {
  CircleUserRound,
  Mail,
  Leaf,
  SquarePen,
  Save,
  Plus,
  Trash2,
  Settings,
} from "lucide-react";
import {
  getCountLetters,
  getCountCorrectedLetters,
  uploadProfilePicture,
  deleteProfilePicture,
  updateUser,
  getUserData,
} from "@/services/api";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ImageUploader } from "@/components/imageUploader";
import { Spinner } from "@/components/ui/spinner-1";
const MapNoSSR = dynamic(() => import("@/components/ui/map"), { ssr: false });
import rawLanguages from "@/lib/languages.json";
import { useDialog } from "@/context/dialogContext";
const languagesData = rawLanguages.languages as {
  name: string;
  image: string;
}[];

export interface User {
  _id: string;
  nickname: string;
  created_at: string;
  email: string;
  image: string;
  learningLanguage: string;
  learningLanguage2: string;
  learningLanguage3: string | null;
  masterLanguage: string;
  masterLanguage2: string;
  masterLanguage3: string;
  bio: string;
  location: {
    city: string;
    country: string;
  };
}

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="page-container">
      <SidebarDemo>
        <ProfilePageContent id={id} />
      </SidebarDemo>
    </div>
  );
}

export const ProfilePageContent = ({ id }: { id: string }) => {
  const [user, setUser] = useState<User>({} as User);
  const [letterCounts, setLetterCounts] = useState<Record<string, number>>({});
  const [correctionCounts, setCorrectionCounts] = useState<
    Record<string, number>
  >({});
  const [editing, setEditing] = useState(false);
  const [bioUser, setBioUser] = useState<string>("");
  const [locationUser, setLocationUser] = useState({
    city: "Madrid",
    country: "Spain",
  });
  const [languagesLearning, setLanguagesLearning] = useState<string[]>([]);
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [addingLanguage, setAddingLanguage] = useState<
    "LEARN" | "MASTER" | null
  >(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profilePictureLocalUrl, setProfilePictureLocalUrl] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { openDialog } = useDialog();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let userData;
      let profilePictureUrl;
      if (id !== "yours") {
        // Fetch user data by ID
        userData = await getUserData(id);
        profilePictureUrl = `http://localhost:3090/uploads/profile_pictures/${userData.image}`;
      } else {
        // Get languages from sessionStorage
        userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
        profilePictureUrl =
          sessionStorage.getItem("profilePictureBase64") || "";

        // If userData is not available, redirect to login
        if (Object.keys(userData).length === 0) {
          console.error("User data not found in sessionStorage.");
          window.location.href = "/";
          return;
        }
      }

      setUser(userData);

      // Guardar las learnigLanguage, learnigLanguage2 y learnigLanguage3 en languagesLearning
      setLanguagesLearning(
        [
          userData.learningLanguage,
          userData.learningLanguage2,
          userData.learningLanguage3,
        ].filter(Boolean),
      );

      // Lo mismo con languagesSpoken
      setLanguagesSpoken(
        [
          userData.masterLanguage,
          userData.masterLanguage2,
          userData.masterLanguage3,
        ].filter(Boolean),
      );

      // Obtener idiomas disponibles, excluyendo esos 6
      setAvailableLanguages(
        languagesData
          .map((lang) => lang.name)
          .filter(
            (lang) =>
              lang !== userData.learningLanguage &&
              lang !== userData.learningLanguage2 &&
              lang !== userData.learningLanguage3 &&
              lang !== userData.masterLanguage &&
              lang !== userData.masterLanguage2 &&
              lang !== userData.masterLanguage3,
          ),
      );

      // Guardar bio y location
      setBioUser(userData.bio);
      setLocationUser(userData.location);

      // Guardar imagen
      if (profilePictureUrl) {
        setProfilePictureLocalUrl(profilePictureUrl);
      }

      // Obtener contadores de cartas y correcciones
      try {
        const counts = await getCountLetters(id === "yours" ? null : id);
        console.log("Letter counts per language:", counts);
        if (counts !== -1) {
          setLetterCounts(counts);
        }

        const countsCorrections = await getCountCorrectedLetters(
          id === "yours" ? null : id,
        );
        if (countsCorrections !== -1) {
          setCorrectionCounts(countsCorrections);
        }
        setIsLoading(true);
      } catch (error) {
        console.error("Error fetching letter counts:", error);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const SaveOnClick = async () => {
    try {
      // Get user data from state
      if (!location) {
        setLocationUser(user.location || { city: "", country: "" });
      }

      // Save image
      let resPicChange;
      if (imageFile) {
        resPicChange = await uploadProfilePicture(imageFile);
      } else {
        resPicChange = await deleteProfilePicture();
        if (resPicChange === 0) {
          setProfilePictureLocalUrl(null);
        }
      }

      // Save data
      const newUserData = {
        ...user,
        bio: bioUser,
        location: locationUser,
        learningLanguage: languagesLearning[0],
        learningLanguage2: languagesLearning[1] || null,
        learningLanguage3: languagesLearning[2] || null,
        masterLanguage: languagesSpoken[0],
        masterLanguage2: languagesSpoken[1] || null,
        masterLanguage3: languagesSpoken[2] || null,
      };

      const response = await updateUser(newUserData);
      if (!response) {
        openDialog({
          title: "Failed to save changes",
          description: "Please try again later...",
          primaryActionText: "OK",
          autoDismiss: false,
          type: "error",
        });
        return;
      }
      setUser(response.userData);
      setEditing(false);

      if (resPicChange === 0) {
        openDialog({
          title: "Profile updated!",
          description: "Your data has been updated successfully 👍🏽",
          primaryActionText: "OK",
          autoDismiss: true,
          type: "success",
        });
      } else {
        openDialog({
          title: "Profile updated!",
          description:
            "However, these was trouble changing your profile picture. Try again later.",
          primaryActionText: "OK",
          autoDismiss: true,
          type: "success",
        });
      }
    } catch (_error) {
      openDialog({
        title: "Failed to save changes",
        description: "Please try again later...",
        primaryActionText: "OK",
        autoDismiss: false,
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} color="gray" />
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
      <h1 className="ml-5 mt-10 lg:mt-0 text-5xl lg:text-md h-[7%] text-3xl font-semibold w-fit bg-gradient-to-r from-[#8EBA03] via-yellow-500 to-[#8EBA03] bg-clip-text text-transparent animate-text text-center lg:text-left">
        {id !== "yours" ? `${user.nickname}` : "Your profile"}
      </h1>

      <div className="mb-10 lg:mb-0 flex gap-2 flex-1 h-[85%]">
        {/* Bloque pantalla */}
        <div className="h-full w-full rounded-lg bg-gray-50 px-5 lg:px-15 py-10 text-black flex flex-col">
          {/* Botones Edit */}
          {id === "yours" && (
            <div className="h-[6%] flex justify-end">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="w-auto h-[3rem] cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-200 shadow-md py-2 px-4 hover:bg-white flex flex-row gap-2 justify-center items-center mr-2"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => SaveOnClick()}
                    className="w-auto h-[3rem] cursor-pointer text-white border border-lightblack rounded-sm bg-[#8EBA03] shadow-md py-2 px-4 hover:bg-[#7BA102] flex flex-row gap-2 justify-center items-center"
                  >
                    <Save></Save>
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      openDialog({
                        title: "Settings",
                        description: "Manage your account settings.",
                        primaryActionText: "Cancel",
                        autoDismiss: false,
                        type: "settings",
                      })
                    }
                    className="w-auto h-[3rem] cursor-pointer text-gray-700 hover:text-[#8EBA03] border border-lightblack rounded-sm bg-gray-50 shadow-md py-2 px-4 hover:bg-white flex flex-row gap-2 justify-center items-center mr-2"
                  >
                    <Settings />
                    Settings
                  </button>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="w-auto h-[3rem] cursor-pointer text-gray-700 hover:text-[#8EBA03] border border-lightblack rounded-sm bg-gray-50 shadow-md py-2 px-4 hover:bg-white flex flex-row gap-2 justify-center items-center"
                  >
                    <SquarePen />
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
          {/* Primera fila info */}
          <div className="lg:h-[30%] flex flex-col lg:flex-row gap-2 items-start">
            <div className="w-full lg:w-[50%] relative flex items-center justify-center">
              <div className="w-[35%]">
                <ImageUploader
                  onImageSelect={(f: File | null) => setImageFile(f)}
                  currentPicLocalUrl={profilePictureLocalUrl}
                  active={editing}
                  size={innerWidth > 750 ? "125px" : null}
                />
              </div>

              <div className="w-full">
                <div className="flex flex-col gap-1 w-auto">
                  <span className="font-bold">Nickname</span>
                  <div className="flex flex-row align-center items-center gap-2 cursor-pointer bg-white border border-lightblack text-gray-700 rounded-sm py-2 px-4 mb-4 bg-gray-50">
                    <CircleUserRound className="text-gray-500"></CircleUserRound>
                    <p className="w-full outline-none">{user.nickname}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-auto flex-grow">
                  <span className="font-bold">Email</span>
                  <div className="flex flex-row align-center items-center gap-2 cursor-pointer bg-white border border-lightblack text-gray-700 rounded-sm py-2 px-4 mb-4 bg-gray-50">
                    <Mail className="text-gray-500"></Mail>
                    <p className="w-full outline-none">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[50%]">
              <span className="font-bold">Bio</span>
              <div className="flex flex-row h-35 w-full gap-2 cursor-pointer bg-white border border-lightblack text-gray-700 rounded-sm p-5 bg-gray-50">
                <Leaf className="text-gray-500"></Leaf>
                <textarea
                  disabled={!editing}
                  value={bioUser}
                  onChange={(e) => setBioUser(e.target.value)}
                  placeholder="This is where I'd put my biography... if only I had one! 😩"
                  className="w-full outline-none align-top resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Segunda fila info */}
          <div className="flex flex-col lg:flex-row gap-10 w-full h-[70%] justify-between">
            {/* Idiomas */}
            <div className="lg:w-[40%] h-[90%]">
              <div className="flex flex-col gap-10 items-center p-7 rounded-lg bg-[#8EBA03] bg-white border border-gray-200 border-2 mb-3">
                <div className="flex flex-row gap-15">
                  <div className="flex flex-col gap-5">
                    <h3 className="font-bold">Languages learning</h3>
                    <div className="flex flex-row gap-3">
                      {languagesLearning.map((lang, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`/flags/${lang}.svg`}
                            className="h-7 w-7 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-300 shadow"
                          ></img>
                          {editing && (
                            <Trash2
                              className="absolute h-7 w-7 sm:h-10 sm:w-10 rounded-full p-2 inset-0 hover:bg-black/50 text-transparent hover:text-white"
                              onClick={() => {
                                if (languagesLearning.length <= 1) {
                                  return;
                                }
                                setLanguagesLearning((prev) =>
                                  prev.filter((l) => l !== lang),
                                );
                                setAvailableLanguages((prev) => [
                                  ...prev,
                                  lang,
                                ]);
                              }}
                            ></Trash2>
                          )}
                        </div>
                      ))}
                      {editing && (
                        <Plus
                          onClick={() => {
                            if (addingLanguage === "LEARN")
                              setAddingLanguage(null);
                            else setAddingLanguage("LEARN");
                          }}
                          className={`h-7 w-7 sm:h-10 sm:w-10  rounded-full bg-gray-200 p-2 ${addingLanguage === "LEARN" ? "bg-lime-300" : ""}`}
                        ></Plus>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <h3 className="font-bold">Mastered languages</h3>
                    <div className="flex flex-row gap-3">
                      {languagesSpoken.map((lang, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`/flags/${lang}.svg`}
                            className="h-7 w-7 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-300 shadow"
                          ></img>
                          {editing && (
                            <Trash2
                              className="absolute h-7 w-7 sm:h-10 sm:w-10 rounded-full p-2 inset-0 hover:bg-black/50 text-transparent hover:text-white"
                              onClick={() => {
                                if (languagesSpoken.length <= 1) {
                                  return;
                                }
                                setLanguagesSpoken((prev) =>
                                  prev.filter((l) => l !== lang),
                                );
                                setAvailableLanguages((prev) => [
                                  ...prev,
                                  lang,
                                ]);
                              }}
                            ></Trash2>
                          )}
                        </div>
                      ))}
                      {editing && (
                        <Plus
                          onClick={() => {
                            if (addingLanguage === "MASTER")
                              setAddingLanguage(null);
                            else setAddingLanguage("MASTER");
                          }}
                          className={`h-7 w-7 sm:h-10 sm:w-10  rounded-full bg-gray-200 p-2 ${addingLanguage === "MASTER" ? "bg-lime-300" : ""}`}
                        ></Plus>
                      )}
                    </div>
                  </div>
                </div>
                {editing && (
                  <>
                    {addingLanguage === "LEARN" && (
                      <h2 className="text-lime-600">
                        Adding to learning languages
                      </h2>
                    )}
                    {addingLanguage === "MASTER" && (
                      <h2 className="text-lime-600">
                        Adding to mastered languages
                      </h2>
                    )}
                    {!addingLanguage && <h2>Available languages</h2>}
                    <div className="grid grid-flow-col auto-cols-max gap-2 justify-center">
                      {availableLanguages.map((lang) => (
                        <motion.img
                          key={lang}
                          src={`/flags/${lang}.svg`}
                          alt={lang}
                          className="cursor-pointer rounded-full border border-gray-300 shadow h-7 w-7 sm:h-10 sm:w-10 "
                          whileHover={{ scale: 1.1 }}
                          onClick={() => {
                            if (!addingLanguage) {
                              return;
                            }
                            if (
                              addingLanguage === "MASTER" &&
                              languagesSpoken.length < 3
                            ) {
                              setLanguagesSpoken((prev) => [...prev, lang]);
                              setAvailableLanguages((prev) =>
                                prev.filter((l) => l !== lang),
                              );
                            } else if (
                              addingLanguage === "LEARN" &&
                              languagesLearning.length < 3
                            ) {
                              setLanguagesLearning((prev) => [...prev, lang]);
                              setAvailableLanguages((prev) =>
                                prev.filter((l) => l !== lang),
                              );
                            }
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!editing && (
                <div className="h-[70%] p-7 rounded-lg bg-[#8EBA03] bg-white border border-gray-200 border-2">
                  <div
                    className={`flex flex-row gap-10 text-xl w-full justify-around h-full ${letterCounts && Object.values(letterCounts).reduce((a, b) => a + b, 0) < 1 && correctionCounts && Object.values(correctionCounts).reduce((a, b) => a + b, 0) < 1 ? "items-center" : "items-start"}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-5xl font-medium">
                        {letterCounts &&
                          Object.values(letterCounts).reduce(
                            (a, b) => a + b,
                            0,
                          )}{" "}
                        ✉️
                      </p>
                      <h3 className="font-bold"> Letters written</h3>
                      <ul className="flex flex-col gap-2 mt-3">
                        {letterCounts &&
                          Object.entries(letterCounts).map(([lang, count]) => (
                            <li key={lang} className="flex flex-row gap-3">
                              <img
                                src={`/flags/${lang}.svg`}
                                className="h-7 w-7 rounded-full"
                              ></img>
                              {count} in {lang}
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <p className="text-5xl font-medium">
                        {correctionCounts &&
                          Object.values(correctionCounts).reduce(
                            (a, b) => a + b,
                            0,
                          )}{" "}
                        💌
                      </p>
                      <h3 className="font-bold"> Letters corrected</h3>
                      <ul className="flex flex-col gap-2 mt-3">
                        {correctionCounts &&
                          Object.entries(correctionCounts).map(
                            ([lang, count]) => (
                              <li key={lang} className="flex flex-row gap-3">
                                <img
                                  src={`/flags/${lang}.svg`}
                                  className="h-7 w-7 rounded-full"
                                ></img>
                                {count} in {lang}
                              </li>
                            ),
                          )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mapa */}
            <div className="lg:w-[60%] h-[20rem] lg:h-[90%] flex flex-col items-center p-2 rounded-lg bg-[#8EBA03] bg-white border border-gray-200 border-2">
              <MapNoSSR
                key={user._id + "_" + editing}
                selectedCountry={locationUser?.country || "No location"}
                editing={editing}
                onCountryChange={(newCountry) =>
                  setLocationUser((prev) => ({ ...prev, country: newCountry }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

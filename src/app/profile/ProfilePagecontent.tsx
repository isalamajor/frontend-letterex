"use client";
import { useState, useEffect, useCallback, useContext } from "react";
import {
  CircleUserRound,
  Mail,
  Leaf,
  Calendar,
  SquarePen,
  Save,
  Plus,
  Trash2,
  Settings,
  Loader,
} from "lucide-react";
import {
  uploadProfilePicture,
  deleteProfilePicture,
  updateUser,
  getUserData,
  deleteFriend,
} from "@/services/api";
import { UserData } from "@/lib/types";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import AppPageSkeleton from "@/components/appPageSkeleton";
import rawLanguages from "@/lib/languages.json";
import { useDialog } from "@/context/dialogContext";
import { UserContext } from "@/context/userContext";
import { isUserComplete } from "@/lib/utils";

const MapNoSSR = dynamic(() => import("@/components/ui/map"), { ssr: false });
const ImageUploader = dynamic(() => import("@/components/imageUploader"), {
  loading: () => <div>Loading...</div>,
});

const languagesData = rawLanguages.languages as {
  name: string;
  image: string;
}[];

interface profileData {
  userData: UserData | null;
  isLoading: boolean;
  fetchError: boolean;
}

const ProfilePageContent = ({ id }: { id: string }) => {
  const [data, setData] = useState<profileData>({
    userData: null,
    isLoading: true,
    fetchError: false,
  });
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addingLanguage, setAddingLanguage] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageWasRemoved, setImageWasRemoved] = useState(false);
  const { openDialog } = useDialog();
  const { userData, setUserData } = useContext(UserContext);

  // Helper functions para convertir campos individuales a arrays
  const getLearningLanguages = (): string[] => {
    if (!data?.userData) return [];
    return [
      data.userData.learningLanguage,
      data.userData.learningLanguage2,
      data.userData.learningLanguage3,
    ].filter((lang): lang is string => Boolean(lang));
  };

  const getMasterLanguages = (): string[] => {
    if (!data?.userData) return [];
    return [
      data.userData.masterLanguage,
      data.userData.masterLanguage2,
      data.userData.masterLanguage3,
    ].filter((lang): lang is string => Boolean(lang));
  };

  const removeLearningLanguage = (langToRemove: string) => {
    if (!data?.userData) return;
    const currentLangs = getLearningLanguages();
    if (currentLangs.length <= 1) return; // Keep at least one

    // Build explicitly without the removed language
    const remaining = [
      data.userData.learningLanguage,
      data.userData.learningLanguage2,
      data.userData.learningLanguage3,
    ].filter((lang): lang is string => Boolean(lang) && lang !== langToRemove);

    updateUserData({
      learningLanguage: remaining[0] || null,
      learningLanguage2: remaining[1] || null,
      learningLanguage3: remaining[2] || null,
    });
    setAvailableLanguages((prev) => [...prev, langToRemove]);
  };

  const removeMasterLanguage = (langToRemove: string) => {
    if (!data?.userData) return;
    const currentLangs = getMasterLanguages();
    if (currentLangs.length <= 1) return; // Keep at least one

    // Build explicitly without the removed language
    const remaining = [
      data.userData.masterLanguage,
      data.userData.masterLanguage2,
      data.userData.masterLanguage3,
    ].filter((lang): lang is string => Boolean(lang) && lang !== langToRemove);

    updateUserData({
      masterLanguage: remaining[0] || null,
      masterLanguage2: remaining[1] || null,
      masterLanguage3: remaining[2] || null,
    });
    setAvailableLanguages((prev) => [...prev, langToRemove]);
  };

  const addLearningLanguage = (lang: string) => {
    if (!data?.userData) return;
    const currentLangs = getLearningLanguages();
    if (currentLangs.length >= 3) return;

    // Agregar el nuevo idioma al final del array existente
    const newLangs = [...currentLangs, lang];
    updateUserData({
      learningLanguage: newLangs[0] || null,
      learningLanguage2: newLangs[1] || null,
      learningLanguage3: newLangs[2] || null,
    });
    setAvailableLanguages((prev) => prev.filter((l) => l !== lang));
  };

  const addMasterLanguage = (lang: string) => {
    if (!data?.userData) return;
    const currentLangs = getMasterLanguages();
    if (currentLangs.length >= 3) return;

    // Agregar el nuevo idioma al final del array existente
    const newLangs = [...currentLangs, lang];
    updateUserData({
      masterLanguage: newLangs[0] || null,
      masterLanguage2: newLangs[1] || null,
      masterLanguage3: newLangs[2] || null,
    });
    setAvailableLanguages((prev) => prev.filter((l) => l !== lang));
  };

  const updateData = useCallback(
    (updates: Partial<profileData>) =>
      setData((prev) => (prev ? { ...prev, ...updates } : prev)),
    [],
  );
  const updateUserData = useCallback(
    (updates: Partial<UserData>) =>
      setData((prev) =>
        prev && prev.userData
          ? {
              ...prev,
              userData: {
                ...prev.userData,
                ...updates,
              } as UserData,
            }
          : prev,
      ),
    [],
  );

  const fetchData = async () => {
    updateData({ isLoading: true });
    let thisUserData;
    if (id !== "me") {
      // Fetch user data by ID
      const result = await getUserData(id);
      if (!result.ok || !result.data) {
        updateData({ fetchError: true, isLoading: false });
        return;
      }
      thisUserData = result.data;
    } else {
      // Prefer context data; if missing after hard reload, recover from session/API.
      thisUserData = userData;

      if (!isUserComplete(thisUserData)) {
        const result = await getUserData();
        if (!result.ok || !result.data) {
          window.location.href = "/";
          return;
        }
        thisUserData = result.data;
        setUserData(result.data);
      }
    }

    updateData({ userData: { ...thisUserData } });

    // Obtener idiomas disponibles, excluyendo esos 6
    setAvailableLanguages(
      languagesData
        .map((lang) => lang.name)
        .filter(
          (lang) =>
            lang !== thisUserData.learningLanguage &&
            lang !== thisUserData.learningLanguage2 &&
            lang !== thisUserData.learningLanguage3 &&
            lang !== thisUserData.masterLanguage &&
            lang !== thisUserData.masterLanguage2 &&
            lang !== thisUserData.masterLanguage3,
        ),
    );
    updateData({ isLoading: false });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!editing) {
      setImageWasRemoved(false);
      setImageFile(null);
    }
  }, [editing]);

  const SaveOnClick = async () => {
    if (!data || !data.userData) return;
    setIsSaving(true);
    try {
      // Save image only if it was modified
      let resPicChange = undefined;
      if (imageFile) {
        // New image was uploaded
        resPicChange = await uploadProfilePicture(imageFile);
      } else if (imageWasRemoved && data.userData.image) {
        // Image was removed (only delete if one existed before)
        resPicChange = await deleteProfilePicture();
        if (resPicChange.ok) {
          updateUserData({ image: null });
        }
      }
      // If neither imageFile nor imageWasRemoved, don't call upload/delete APIs

      // Save data
      const { image, ...dataToSave } = data.userData;
      const response = await updateUser(dataToSave);
      if (!response.ok) {
        openDialog({
          title: "Failed to save changes",
          description: "Please try again later...",
          primaryActionText: "OK",
          autoDismiss: false,
          type: "error",
        });
        return;
      }
      if (response.data) {
        updateData({
          userData: {
            ...response.data,
            countLetters: data.userData.countLetters,
            countCorrectedLetter: data.userData.countCorrectedLetter,
          },
        });
      }
      setEditing(false);
      setImageFile(null);
      setImageWasRemoved(false);

      if (resPicChange && resPicChange.ok) {
        openDialog({
          title: "Profile updated!",
          description: "Your data has been updated successfully 👍🏽",
          primaryActionText: "OK",
          autoDismiss: true,
          type: "success",
        });
      } else if (resPicChange && !resPicChange.ok) {
        openDialog({
          title: "Profile updated!",
          description:
            "However, these was trouble changing your profile picture. Try again later.",
          primaryActionText: "OK",
          autoDismiss: true,
          type: "success",
        });
      } else {
        openDialog({
          title: "Profile updated!",
          description: "Your data has been updated successfully 👍🏽",
          primaryActionText: "OK",
          autoDismiss: true,
          type: "success",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteFriendClicked = async () => {
    if (!data.userData?.id || !data.userData?.nickname) return;
    openDialog({
      type: "askConfirmation",
      title: `Are you sure you want to delete ${data.userData?.nickname} from your contacts?`,
      description: "You won't be able to exchange letters with them anymore.",
      primaryActionText: "Cancel",
      autoDismiss: false,
      onConfirmationPositive: async () => {
        const success = await deleteFriend(data.userData?.id);
        if (success) {
          updateData({
            userData: data.userData
              ? { ...data.userData, isFriend: false }
              : null,
          });
        } else {
          openDialog({
            title: "Failed to delete friend",
            description: "Please try again later...",
            primaryActionText: "OK",
            autoDismiss: false,
            type: "error",
          });
        }
      },
    });
  };

  if (!data || data.isLoading) {
    return (
      <AppPageSkeleton titleWidthClass="w-64" contentHeightClass="h-[52vh]" />
    );
  }
  if (data.fetchError || !data.userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        An error occurred when fetching data. Try again later.
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
      <h1 className="ml-5 mt-10 lg:mt-0 text-5xl lg:text-md h-[7%] text-3xl font-semibold w-fit bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-text text-center lg:text-left">
        {id !== "me" ? `${data?.userData.nickname}` : "Your profile"}
      </h1>

      <div className="mb-10 lg:mb-0 flex gap-2 flex-1 h-[85%]">
        {/* Bloque pantalla */}
        <div className="h-full w-full rounded-lg bg-gray-50 dark:bg-neutral-800 px-5 lg:px-15 py-10 text-black dark:text-gray-100 flex flex-col">
          {/* Botones Edit */}
          {id === "me" && (
            <div className="h-[6%] flex justify-end">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="w-auto h-[3rem] cursor-pointer text-gray-800 dark:text-gray-200 border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-200 dark:bg-neutral-700 shadow-md py-2 px-4 hover:bg-white dark:hover:bg-neutral-600 flex flex-row gap-2 justify-center items-center mr-2"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => SaveOnClick()}
                    disabled={isSaving}
                    className="w-auto h-[3rem] cursor-pointer text-white border border-lightblack rounded-sm bg-blue-500 shadow-md py-2 px-4 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed flex flex-row gap-2 justify-center items-center"
                  >
                    {isSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader />
                      </motion.div>
                    ) : (
                      <>
                        <Save />
                        Save
                      </>
                    )}
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
                    className="w-auto h-[3rem] cursor-pointer text-gray-800 dark:text-gray-200 hover:text-sky-500 border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-50 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-white dark:hover:bg-neutral-700 flex flex-row gap-2 justify-center items-center mr-2"
                  >
                    <Settings />
                    Settings
                  </button>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="w-auto h-[3rem] cursor-pointer text-gray-800 dark:text-gray-200 hover:text-sky-500 border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-50 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-white dark:hover:bg-neutral-700 flex flex-row gap-2 justify-center items-center"
                  >
                    <SquarePen />
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
          {data?.userData.isFriend && (
            <div className="flex justify-end mb-2 cursor-pointer">
              <button
                className="w-auto h-[3rem] cursor-pointer text-white rounded-sm bg-red-400 border-3 border-transparent hover:border-red-500 shadow-md py-2 px-4 items-center mr-2"
                onClick={onDeleteFriendClicked}
              >
                Delete friend
              </button>
            </div>
          )}
          {/* Primera fila info */}
          <div className="lg:h-[30%] flex flex-col lg:flex-row gap-2 items-start">
            <div className="w-full lg:w-[50%] relative flex items-center justify-center">
              <div className="w-[35%]">
                <ImageUploader
                  onImageSelect={(f: File | null) => setImageFile(f)}
                  onImageRemove={() => setImageWasRemoved(true)}
                  currentPicLocalUrl={data.userData.image}
                  active={editing}
                  size={innerWidth > 750 ? "125px" : null}
                />
              </div>

              <div className="w-full">
                <div className="flex flex-col gap-1 w-auto">
                  <span className="font-bold">Nickname</span>
                  <div className="flex flex-row align-center items-center gap-2 cursor-pointer bg-white dark:bg-neutral-900 border border-lightblack dark:border-neutral-700 text-gray-500 dark:text-gray-200 rounded-sm py-2 px-4 mb-4">
                    <CircleUserRound />
                    <p className="w-full outline-none">
                      {data.userData.nickname}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-auto flex-grow">
                  <span className="font-bold">Joined at</span>
                  <div className="flex flex-row align-center items-center gap-2 cursor-pointer bg-white dark:bg-neutral-900 border border-lightblack dark:border-neutral-700 text-gray-500 dark:text-gray-200 rounded-sm py-2 px-4 mb-4">
                    <Calendar />
                    <p className="w-full outline-none">
                      {data.userData.created_at
                        ? new Date(data.userData.created_at).toLocaleDateString(
                            "en-EN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[50%]">
              <span className="font-bold">Bio</span>
              <div className="flex flex-row h-35 w-full gap-2 cursor-pointer bg-white dark:bg-neutral-900 border border-lightblack dark:border-neutral-700 text-gray-500 dark:text-gray-200 rounded-sm p-5">
                <Leaf />
                <textarea
                  disabled={!editing}
                  value={data.userData.bio}
                  onChange={(e) => updateUserData({ bio: e.target.value })}
                  placeholder="This is where I'd put my biography... if only I had one! 😩"
                  className="w-full outline-none align-top resize-none"
                ></textarea>
              </div>
            </div>
          </div>
          {/* Segunda fila info */}
          <div className="flex flex-col lg:flex-row gap-10 w-full h-[70%] justify-between dark:text-gray-200 ">
            {/* Idiomas */}
            <div className="lg:w-[40%] h-[90%]">
              <div className="flex flex-col gap-10 items-center p-7 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 border-2 mb-3 ">
                <div className="flex flex-row gap-15">
                  <div className="flex flex-col gap-5">
                    <h3 className="font-bold">Languages learning</h3>
                    <div className="flex flex-row gap-3">
                      {getLearningLanguages().map((lang, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`/flags/${lang}.svg`}
                            className="h-7 w-7 sm:h-10 sm:w-10 rounded-full object-cover shadow"
                          />
                          {editing && (
                            <Trash2
                              className="absolute h-7 w-7 sm:h-10 sm:w-10 rounded-full p-2 inset-0 hover:bg-black/50 text-transparent hover:text-white cursor-pointer"
                              onClick={() => removeLearningLanguage(lang)}
                            />
                          )}
                        </div>
                      ))}
                      {editing && getLearningLanguages().length < 3 && (
                        <Plus
                          onClick={() => {
                            if (addingLanguage === "LEARN")
                              setAddingLanguage(null);
                            else setAddingLanguage("LEARN");
                          }}
                          className={`h-7 w-7 sm:h-10 sm:w-10 rounded-full p-2 cursor-pointer ${
                            addingLanguage === "LEARN"
                              ? "bg-lime-300 dark:bg-lime-300 text-gray-900"
                              : "bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
                          }`}
                        ></Plus>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <h3 className="font-bold">Mastered languages</h3>
                    <div className="flex flex-row gap-3">
                      {getMasterLanguages().map((lang, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`/flags/${lang}.svg`}
                            className="h-7 w-7 sm:h-10 sm:w-10 rounded-full object-cover shadow"
                          />
                          {editing && (
                            <Trash2
                              className="absolute h-7 w-7 sm:h-10 sm:w-10 rounded-full p-2 inset-0 hover:bg-black/50 text-transparent hover:text-white cursor-pointer"
                              onClick={() => removeMasterLanguage(lang)}
                            />
                          )}
                        </div>
                      ))}
                      {editing && getMasterLanguages().length < 3 && (
                        <Plus
                          onClick={() => {
                            if (addingLanguage === "MASTER")
                              setAddingLanguage(null);
                            else setAddingLanguage("MASTER");
                          }}
                          className={`h-7 w-7 sm:h-10 sm:w-10 rounded-full p-2 cursor-pointer ${
                            addingLanguage === "MASTER"
                              ? "bg-lime-300 dark:bg-lime-300 text-gray-900"
                              : "bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-200"
                          }`}
                        />
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
                          className="cursor-pointer rounded-full shadow h-7 w-7 sm:h-10 sm:w-10 "
                          whileHover={{ scale: 1.1 }}
                          onClick={() => {
                            if (!addingLanguage) return;
                            if (addingLanguage === "MASTER") {
                              addMasterLanguage(lang);
                            } else if (addingLanguage === "LEARN") {
                              addLearningLanguage(lang);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!editing && (
                <div className="h-[70%] p-7 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 border-2">
                  <div
                    className={`flex flex-row gap-10 text-xl w-full justify-around h-full
                      ${
                        data.userData.countLetters &&
                        Object.values(data.userData.countLetters).reduce(
                          (a, b) => a + b,
                          0,
                        ) < 1 &&
                        data.userData.countCorrectedLetter &&
                        Object.values(
                          data.userData.countCorrectedLetter,
                        ).reduce((a, b) => a + b, 0) < 1
                          ? "items-center"
                          : "items-start"
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-5xl font-medium">
                        {data.userData.countLetters &&
                          Object.values(data.userData.countLetters).reduce(
                            (a, b) => a + b,
                            0,
                          )}{" "}
                        ✉️
                      </p>
                      <h3 className="font-bold"> Letters written</h3>
                      <ul className="flex flex-col gap-2 mt-3">
                        {data.userData.countLetters &&
                          Object.entries(data.userData.countLetters).map(
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

                    <div className="flex flex-col items-center gap-2">
                      <p className="text-5xl font-medium">
                        {data.userData.countCorrectedLetter &&
                          Object.values(
                            data.userData.countCorrectedLetter,
                          ).reduce((a, b) => a + b, 0)}{" "}
                        💌
                      </p>
                      <h3 className="font-bold"> Letters corrected</h3>
                      <ul className="flex flex-col gap-2 mt-3">
                        {data.userData.countCorrectedLetter &&
                          Object.entries(
                            data.userData.countCorrectedLetter,
                          ).map(([lang, count]) => (
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
                  </div>
                </div>
              )}
            </div>

            {/* Mapa */}
            <div className="lg:w-[60%] h-[20rem] lg:h-[90%] flex flex-col items-center p-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 border-2 ">
              <MapNoSSR
                key={data.userData.id + "_" + editing}
                selectedCountry={
                  data.userData.location?.country || "No location"
                }
                editing={editing}
                onCountryChange={(newCountry) =>
                  updateUserData({
                    location: {
                      ...(data.userData?.location || {}),
                      country: newCountry,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageContent;

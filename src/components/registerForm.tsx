import { useState, useEffect } from "react";
import "../stylesheets/animatedForm.css";
import { motion } from "framer-motion";
import LanguageSelector from "./languageSelector";
import {
  register,
  isUsernameInUse,
  sendVerificationCode,
  isEmailInUse,
  checkVerificationCode,
  uploadProfilePicture,
} from "../services/api";
import { InputPass } from "./ui/inputPass";
import languagesData from "../app/resources/languagesData";
import CodeInput from "./codeInput";
import { ValidationCodePurpose } from "@/lib/types";
import dynamic from "next/dynamic";

const ImageUploader = dynamic(() => import("@/components/imageUploader"), {
  loading: () => <div>Loading...</div>,
});

interface RegisterFormProps {
  goBack: () => void;
  goLogin: () => void;
  moveFrog: () => void;
}

interface language {
  name: string;
  image: string;
}

const CODE_LENGTH = 6;

const RegisterForm = ({ goBack, goLogin, moveFrog }: RegisterFormProps) => {
  const [showAlert, setShowAlert] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);

  const alertStyles = {
    style: { whiteSpace: "pre-line" as const },
    className: "text-red-500 text-base",
  };
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [languagesSpoken, setLanguagesSpoken] = useState<language[]>([]);
  const [languagesLearning, setLanguagesLearning] = useState<language[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Auto-submit verification code when complete
  useEffect(() => {
    if (currentStep === 3 && confirmationCode.length === CODE_LENGTH) {
      checkCodeAttempt();
    }
  }, [confirmationCode, currentStep]);

  const handleImageUpload = (imageFile: File | null) => {
    setProfileImage(imageFile); // Guardar imagen en el estado del padre
  };

  const showAlertMessage = (message: string) => {
    setShowAlert(message);
  };

  const handleNextStep = () => {
    showAlertMessage("");

    // Username and password
    if (currentStep === 1) {
      setUsernameAttempt();
    }
    // Email
    else if (currentStep === 2) {
      setEmailAttempt(email);
      return;
    }
    // Verification code
    else if (currentStep === 3 && confirmationCode.length === CODE_LENGTH) {
      checkCodeAttempt();
      return;
    }
    // Idiomas hablados
    else if (currentStep === 4) {
      if (languagesSpoken.length < 1) {
        showAlertMessage("Please select at least one language you master");
        return;
      }
      setCurrentStep(currentStep + 1);
    }
    // Idiomas aprendidos
    else if (currentStep === 5) {
      if (languagesLearning.length < 1) {
        showAlertMessage(
          "Please select at least one language you are learning",
        );
        return;
      }
      setCurrentStep(currentStep + 1);
      moveFrog();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      goBack();
    }
  };

  const registerAttempt = async () => {
    const result = await register({
      nickname: username,
      email: email,
      password: password,
      masterLanguage: languagesSpoken[0]?.name,
      masterLanguage2: languagesSpoken[1]?.name,
      masterLanguage3: languagesSpoken[2]?.name,
      learningLanguage: languagesLearning[0]?.name,
      learningLanguage2: languagesLearning[1]?.name,
      learningLanguage3: languagesLearning[2]?.name,
      image: null,
    });

    if (result.ok) {
      goLogin();
      if (profileImage) {
        await uploadProfilePicture(profileImage);
      }
    } else {
      setShowAlert(result.errorMessage || "Registration failed");
    }
  };

  const setUsernameAttempt = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }
    if (username.length < 5) {
      showAlertMessage("Username is too short");
      return;
    }
    if (password.length < 8) {
      showAlertMessage("Password is too short");
      return;
    }
    const result = await isUsernameInUse(username);
    if (!result.ok) {
      showAlertMessage(result.errorMessage || "Server is having trouble...");
      return;
    }
    if (result.data) {
      showAlertMessage("This nickname is taken!");
      return;
    }
    setUsername(username);
    setCurrentStep(currentStep + 1);
    return;
  };

  const setEmailAttempt = async (email: string) => {
    // Basic validation
    if (!email.trim() || !email.includes("@")) {
      showAlertMessage("Please enter a valid email address");
      return;
    }

    // Check if email is already in use
    const emailCheckResult = await isEmailInUse(email);
    console.log("in use: ", emailCheckResult);
    if (!emailCheckResult.ok) {
      showAlertMessage(
        emailCheckResult.errorMessage || "Server is having trouble...",
      );
      return;
    }
    if (emailCheckResult.data) {
      showAlertMessage("This email is taken!");
      return;
    }

    // If email is not in use, send the verification code
    setEmail(email);
    const codeResult = await sendVerificationCode(
      email,
      "register" as ValidationCodePurpose,
    );
    if (codeResult.ok) {
      setCurrentStep(currentStep + 1);
    } else {
      showAlertMessage(
        codeResult.errorMessage || "There was a problem validating your email",
      );
      console.log("Problem validating email: " + codeResult.errorMessage);
    }
  };

  const checkCodeAttempt = async () => {
    const result = await checkVerificationCode(
      email,
      confirmationCode,
      "register" as ValidationCodePurpose,
    );
    if (result.ok) {
      setCurrentStep(currentStep + 1);
    } else {
      showAlertMessage(result.errorMessage || "Invalid code");
    }
  };

  return (
    <motion.div
      className="mt-10 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg min-w-[22rem] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {currentStep === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">
            Create your account
          </h2>
          <div className="flex flex-col gap-2 my-5 mx-0 justify-start">
            <input
              className="w-full p-2 mb-2 border rounded form-blank bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              type="text"
              placeholder="Username"
              value={username}
              maxLength={20}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                setUsername(filtered);
                setShowAlert("");
              }}
            />
            <InputPass
              styles="w-full p-0 mb-2 border rounded form-blank focus-visible:ring-[0px] text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
              onChange={(pass) => {
                setPassword(pass);
                setShowAlert("");
              }}
              onEnter={handleNextStep}
              wrongPassword={false}
            />
          </div>
          <p {...alertStyles}>{showAlert}</p>
        </div>
      )}

      {currentStep === 2 && (
        <div className="p-3 pb-0">
          <h2 className="text-lg font-semibold w-[20rem] text-gray-900 dark:text-gray-100">
            Enter an email 📫
          </h2>
          <input
            className="w-full p-2 mb-2 border rounded form-blank bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleNextStep();
            }}
          />
          <p {...alertStyles}>{showAlert}</p>
        </div>
      )}

      {currentStep === 3 && (
        <div className="flex flex-col p-4 gap-2 w-auto pb-0">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
            Check your mailbox📬
          </h3>
          <h4 className="text-lg mb-2 text-gray-700 dark:text-gray-300">
            We sent you a verification code...
          </h4>
          <CodeInput
            setCode={(code) => {
              setConfirmationCode(code);
              showAlertMessage("");
            }}
          />
          <p {...alertStyles}>{showAlert}</p>
        </div>
      )}

      {currentStep === 4 && (
        <div className="slide-form">
          <LanguageSelector
            languagesAvailable={languagesData.filter(
              (lang) =>
                !languagesLearning.includes(lang) &&
                !languagesSpoken.includes(lang),
            )}
            languagesTaken={languagesSpoken}
            titleText="Select the languages you master"
            noneText="what will it be?"
            tooManyText="Three is enough, don't be cocky!"
            onSelectionChange={(selected: language[]) =>
              setLanguagesSpoken(selected)
            }
          />
        </div>
      )}

      {currentStep === 5 && (
        <div className="slide-form">
          <LanguageSelector
            languagesAvailable={languagesData.filter(
              (lang) =>
                !languagesLearning.includes(lang) &&
                !languagesSpoken.includes(lang),
            )}
            languagesTaken={languagesLearning}
            titleText="Select the languages you are learning"
            noneText="...choose at least one"
            tooManyText="Why so ambitious? Let's set a goal of 3 languages"
            onSelectionChange={(selected: language[]) =>
              setLanguagesLearning(selected)
            }
          />
        </div>
      )}

      {currentStep === 6 && (
        <div className="flex flex-col gap-2 px-5 pt-4 w-[22rem]">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {username}, this is your account
          </h2>
          <p className="text-center w-full text-gray-700 dark:text-gray-300">
            {" "}
            📫 {email}{" "}
          </p>
          <div className="flex flex-row justify-between items-center w-full mt-1">
            <div className="languages-profile">
              <strong>Mastering</strong>
              <div className="languages-list-profile">
                {languagesSpoken.map((lang) => (
                  <motion.img
                    key={lang.name}
                    src={lang.image}
                    alt={lang.name}
                    className="cursor-pointer rounded-full border border-gray-300 shadow"
                    style={{ width: "2rem", height: "2rem" }}
                    whileHover={{ scale: 1.1 }}
                  />
                ))}
              </div>
              <strong>Learning</strong>
              <div className="languages-list-profile">
                {languagesLearning.map((lang) => (
                  <motion.img
                    key={lang.name}
                    src={lang.image}
                    alt={lang.name}
                    className="cursor-pointer rounded-full border border-gray-300 shadow"
                    style={{ width: "2rem", height: "2rem" }}
                    whileHover={{ scale: 1.1 }}
                  />
                ))}
              </div>
            </div>
            <div className="profile-picture">
              <ImageUploader onImageSelect={handleImageUpload} />
            </div>
          </div>

          <p {...alertStyles}>{showAlert}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between back-go">
        {currentStep < 7 && (
          <motion.button
            className="p-2 bg-gray-500 text-white rounded btn-animated-form btn-back dark:bg-neutral-700 dark:text-gray-100"
            onClick={handlePrevStep}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ← Back
          </motion.button>
        )}

        {currentStep < 6 ? (
          <motion.button
            className="p-2 bg-blue-500 text-white rounded btn-animated-form btn-go dark:bg-dark-bg-secondary dark:text-white"
            onClick={handleNextStep}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Next
          </motion.button>
        ) : currentStep === 6 ? (
          <motion.button
            className="p-2 bg-blue-500 text-white rounded btn-animated-form btn-finish dark:bg-dark-bg-secondary dark:text-white"
            onClick={registerAttempt}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            All set ✓
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
};

export default RegisterForm;

import { useState, useEffect } from "react";
import { resetPassword } from "@/services/api";
import { ValidationCodePurpose } from "@/lib/types";
import CodeInput from "./codeInput";
import { motion } from "framer-motion";
import { InputPass } from "./ui/inputPass";
import {
  checkVerificationCode,
  sendVerificationCode,
  isEmailInUse,
} from "@/services/api";
import { Check } from "lucide-react";

const CODE_LENGTH = 6;

const ResetPasswordForm = ({ goBack }: { goBack: () => void }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showAlert, setShowAlert] = useState<string>("");
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const btnClass =
    "w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-back";
  const alertStyles = {
    style: { whiteSpace: "pre-line" as const },
    className: "text-red-500 text-base",
  };

  const iconConfig = {
    icon: Check,
    iconBgClass: "bg-green-100 dark:bg-green-900/20",
    iconColorClass: "text-green-600 dark:text-green-400",
    titleDefault: "Success!",
    descriptionDefault: "Your action has been completed successfully.",
    buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90",
  };

  // Auto-submit verification code when complete
  useEffect(() => {
    if (currentStep === 1 && confirmationCode.length === CODE_LENGTH) {
      checkCodeAttempt();
    }
  }, [confirmationCode, currentStep]);

  const checkCodeAttempt = async () => {
    const result = await checkVerificationCode(
      email,
      confirmationCode,
      "password_reset" as ValidationCodePurpose,
    );
    if (result.ok) {
      setCurrentStep(2);
    } else {
      setShowAlert(result.errorMessage || "Invalid code");
    }
  };

  const sendRecoveryCode = async () => {
    // Basic validation
    if (!email.trim() || !email.includes("@")) {
      setShowAlert("Please enter a valid email address");
      return;
    }

    // Check if email is in use
    const emailCheckResult = await isEmailInUse(email);
    if (!emailCheckResult.ok) {
      setShowAlert(
        emailCheckResult.errorMessage || "Server is having trouble...",
      );
      return;
    }
    if (!emailCheckResult.data) {
      setShowAlert("This email is not registered");
      return;
    }

    // If email is in use, send verification code
    const codeResult = await sendVerificationCode(
      email,
      "password_reset" as ValidationCodePurpose,
    );
    if (codeResult.ok) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowAlert(
        codeResult.errorMessage || "There was a problem validating your email",
      );
    }
  };

  const handleChangePassword = async () => {
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setShowAlert("Passwords do not match");
      }
      const result = await resetPassword(email, confirmationCode, password);
      if (result.ok) {
        setCurrentStep(currentStep + 1);
        setTimeout(() => goBack(), 3000);
      } else {
        setShowAlert(result.errorMessage || "An error ocurred...");
      }
    } else {
      setShowAlert("Fill all fields!");
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      sendRecoveryCode();
    } else if (currentStep === 1) {
      checkCodeAttempt();
    } else {
      handleChangePassword();
    }
  };

  return (
    <motion.div
      className="mt-10 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg w-80 w-[22rem] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {currentStep === 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📬 Enter your email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            It must be the email you signed up with
          </p>
          <div className="flex flex-col gap-2 mt-5 mb-3 mx-0 justify-start">
            <input
              className="w-full p-2 mb-2 border rounded form-blank bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              type="text"
              value={email}
              placeholder="Email"
              onChange={(e) => {
                setEmail(e.target.value);
                setShowAlert("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleNextStep();
              }}
            />
            <p {...alertStyles}>{showAlert}</p>
          </div>
        </>
      )}

      {currentStep === 1 && (
        <>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Check your mailbox
          </h3>
          <h4 className="text-lg mb-2 text-gray-700 dark:text-gray-300">
            We sent you a verification code...
          </h4>
          <div className="flex flex-col gap-2 mt-5 mb-3 mx-0 justify-start">
            <CodeInput
              setCode={(code) => {
                setConfirmationCode(code);
                setShowAlert("");
              }}
            />
            <p {...alertStyles}>{showAlert}</p>
          </div>
        </>
      )}

      {currentStep === 2 && (
        <>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Ok! Set a new password
          </h3>
          <InputPass
            styles="w-full p-0 border rounded form-blank focus-visible:ring-[0px] text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
            onChange={(pass) => {
              setPassword(pass);
              setShowAlert("");
            }}
            label="Enter new password"
            placeholder="New password"
            wrongPassword={false}
          />
          <InputPass
            styles="w-full mb-4 p-0 border rounded form-blank focus-visible:ring-[0px] text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700"
            onChange={(pass) => {
              setConfirmPassword(pass);
              setShowAlert("");
            }}
            label="Confirm password"
            placeholder="New password"
            wrongPassword={false}
            onEnter={handleNextStep}
          />

          <p {...alertStyles}>{showAlert}</p>
        </>
      )}

      {currentStep === 3 ? (
        <div className="flex justify-center text-center items-center flex-col gap-2 h-full w-full text-black dark:text-gray-100 m-2 py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 200,
            }}
            className={`flex items-center justify-center rounded-full ${iconConfig.iconBgClass} w-16 h-16`}
          >
            <iconConfig.icon
              className={`w-8 h-8 ${iconConfig.iconColorClass}`}
            />
          </motion.div>
          <p className="text-gray-900 dark:text-gray-100">
            Password changed succesfully
          </p>
        </div>
      ) : (
        <div className="back-go mt-0 pt-0">
          <button
            onClick={goBack}
            className={`${btnClass} dark:bg-neutral-700 dark:text-gray-100`}
          >
            ← Back
          </button>
          <button
            onClick={handleNextStep}
            className={`${btnClass} flex flex-row gap-1 justify-center items-center dark:bg-dark-bg-secondary dark:text-white`}
          >
            {currentStep === 2 ? "Confirm" : "Next"}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ResetPasswordForm;

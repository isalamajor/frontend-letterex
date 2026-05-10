import { useState, useContext, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/api";
import { InputPass } from "./ui/inputPass";
import { motion } from "framer-motion";
import { Spinner } from "./ui/spinner";
import { KeyRound } from "lucide-react";
import axios from "axios";
import { UserContext } from "@/context/userContext";
import { UserData } from "@/lib/types";

// Configure Axios to automatically send cookies
axios.defaults.withCredentials = true;

const LoginForm = ({
  goBack,
  goResetPassword,
}: {
  goBack: () => void;
  goResetPassword: () => void;
}) => {
  const router = useRouter();
  const { setUserData } = useContext(UserContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showAlert, setShowAlert] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const btnClass =
    "w-full p-2 mx-1 bg-green-500 text-white rounded btn-animated-form btn-back";

  const alertStyles = {
    style: { whiteSpace: "pre-line" as const },
    className: "text-red-500 text-base",
  };

  const loginAttempt = async () => {
    if (!email) {
      setShowAlert("Enter your email or nickname");
      return;
    } else if (!password) {
      setShowAlert("...and what's your password?");
      return;
    }

    setIsLoading(true);
    const result = await login({
      email: email,
      password: password,
    });
    console.log("login", result.data);
    if (result.ok) {
      setUserData(result.data as SetStateAction<UserData>);
      //window.location.href = "/homepage";
      router.replace("/homepage");
    } else {
      setShowAlert(result.errorMessage || "Server is having trouble...");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="mt-10 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg w-80 w-[22rem] text-gray-900 border border-gray-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">
        Log in
      </h2>
      <div
        className="flex flex-col gap-2 mt-5 mb-3 mx-0 justify-start"
        style={{ opacity: isLoading ? 0.5 : 1 }}
      >
        <input
          className="w-full p-2 mb-2 border rounded form-blank bg-white text-gray-900 dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 "
          type="text"
          value={email}
          placeholder="Email/Username"
          onChange={(e) => {
            setEmail(e.target.value);
            setShowAlert("");
          }}
        />
        <InputPass
          styles="w-full p-0 border rounded form-blank focus-visible:ring-[0px] text-gray-900 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 "
          onChange={(pass) => {
            setPassword(pass);
            setShowAlert("");
          }}
          onEnter={() => {
            if (!isLoading) loginAttempt();
          }}
          wrongPassword={false}
        />

        <p {...alertStyles}>{showAlert}</p>
        <p
          className="text-[color:var(--background)] dark:text-[#00f386]/90 hover:underline cursor-pointer text-sm flex flex-row gap-1 justify-end items-center"
          onClick={goResetPassword}
        >
          <KeyRound size={16} />
          Forgot password
        </p>
      </div>
      <div className="mt-4 flex justify-between back-go">
        <motion.button
          onClick={goBack}
          className={btnClass}
          disabled={isLoading}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ← Back
        </motion.button>
        <motion.button
          onClick={loginAttempt}
          className={`${btnClass} flex flex-row gap-1 justify-center items-center`}
          disabled={isLoading}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isLoading ? <Spinner color="white" /> : "Go →"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LoginForm;

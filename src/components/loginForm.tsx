import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/api";
import { InputPass } from "./ui/inputPass";
import { motion } from "framer-motion";
import { Spinner } from "./ui/spinner-1";
import { KeyRound } from "lucide-react";
import axios from "axios";

// Configurar Axios para enviar cookies automáticamente
axios.defaults.withCredentials = true;

const LoginForm = ({
  goBack,
  goResetPassword,
}: {
  goBack: () => void;
  goResetPassword: () => void;
}) => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showAlert, setShowAlert] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const btnClass =
    "w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-back";
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
    if (result.ok && result.data) {
      // El backend devuelve la cookie con Set-Cookie (HttpOnly, Secure, SameSite)
      // No necesitamos setearla desde el cliente
      sessionStorage.setItem("userData", JSON.stringify(result.data.userData));
      router.push("/homepage");
    } else {
      setShowAlert(result.errorMessage || "Server is having trouble...");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="mt-10 bg-white p-6 rounded-lg shadow-lg w-80 w-[22rem]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-lg font-semibold mb-4">Log in</h2>
      <div
        className="flex flex-col gap-2 mt-5 mb-3 mx-0 justify-start"
        style={{ opacity: isLoading ? 0.5 : 1 }}
      >
        <input
          className="w-full p-2 mb-2 border rounded form-blank"
          type="text"
          value={email}
          placeholder="Email/Username"
          onChange={(e) => {
            setEmail(e.target.value);
            setShowAlert("");
          }}
        />
        <InputPass
          styles="w-full p-0 border rounded form-blank focus-visible:ring-[0px] text-gray-900"
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
          className="text-[color:var(--background)] hover:underline cursor-pointer text-sm flex flex-row gap-1 justify-end items-center"
          onClick={goResetPassword}
        >
          <KeyRound size={16} />
          Forgot password
        </p>
      </div>
      <div className="back-go mt-0 pt-0">
        <button onClick={goBack} className={btnClass} disabled={isLoading}>
          ← Back
        </button>
        <button
          onClick={loginAttempt}
          className={`${btnClass} flex flex-row gap-1 justify-center items-center`}
          disabled={isLoading}
        >
          {isLoading ? <Spinner color="white" /> : "Go →"}
        </button>
      </div>
    </motion.div>
  );
};

export default LoginForm;

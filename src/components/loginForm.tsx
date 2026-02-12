import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/api/user";
import { InputPass } from "./ui/inputPass";
import { motion } from "framer-motion";
import { Spinner } from "./ui/spinner-1";

const LoginForm = ({ goBack }: { goBack: () => void }) => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showAlert, setShowAlert] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const btnClass =
    "w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-back";

  const loginAttempt = async () => {
    if (!email) {
      setShowAlert("Enter your email or nickname");
      return;
    } else if (!password) {
      setShowAlert("...and what's your password?");
      return;
    }

    const result = await login({
      email: email,
      password: password,
    });
    if (result.status === 0) {
      sessionStorage.setItem("authToken", result.token);
      sessionStorage.setItem("userData", JSON.stringify(result.userData));
      router.push("../homepage");
    } else if (result.status > 0) {
      setShowAlert(result.message);
    } else {
      setShowAlert("Server is having trouble...");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size={40} color="white" />
        </div>
      ) : (
        <motion.div
          className="mt-10 bg-white p-6 rounded-lg shadow-lg w-80 w-[22rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-lg font-semibold mb-4">Log in</h2>
          <div
            className="flex flex-col gap-2 my-5 mx-0 justify-start"
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
              styles="w-full p-0 mb-2 border rounded form-blank focus-visible:ring-[0px] text-gray-900"
              onChange={(pass) => {
                setPassword(pass);
                setShowAlert("");
              }}
              label={false}
              wrongPassword={false}
            />
            <p style={{ whiteSpace: "pre-line" }} className="text-red-500">
              {showAlert}
            </p>
          </div>
          <div className="back-go">
            <button onClick={goBack} className={btnClass} disabled={isLoading}>
              ← Back
            </button>
            <button
              onClick={loginAttempt}
              className={btnClass}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Go →"}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default LoginForm;
function sleep(arg0: number) {
  throw new Error("Function not implemented.");
}

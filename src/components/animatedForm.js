"use client";

import "../stylesheets/animatedForm.css";
import { useState, useRef, useEffect } from "react";
import { MdOutlineSensorDoor } from "react-icons/md";
import { RiPlantLine } from "react-icons/ri";
import { motion } from "framer-motion";
import LanguageSelector from "./languageSelector";
import {
  login,
  register,
  isUsernameInUse,
  sendVerificationCode,
  isEmailInUse,
  checkVerificationCode,
  uploadProfilePicture,
} from "../services/api";
import { ImageUploader } from "@/components/imageUploader";
import { useRouter } from "next/navigation";
import { Typewriter } from "./ui/typeWriter";
import { InputPass } from "./ui/inputPass";
import FrogAnimation from "@/components/frogAnimation1";
import languagesData from "../app/resources/languagesData";

const phrases = [
  "Write about your passions",
  "Exchange language corrections",
  "Find people to share and learn",
];

export default function AnimatedForm() {
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAlert, setShowAlert] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const [languagesLearning, setLanguagesLearning] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const inputRefs = useRef([]); // Referencias a los inputs del código de confirmación
  const [frogSettings, setFrogSettings] = useState({
    register: { top: "30%", left: "50%", width: 200 },
    login: { top: "30%", left: "50%", width: 200 },
    other: { top: "30%", left: "50%", width: 200 },
  });

  useEffect(() => {
    const updateWidth = () => {
      const w = window.innerWidth;
      if (w < 480)
        setFrogSettings({
          register: { top: "20%", left: "50%", width: 150 },
          login: { top: "20%", left: "50%", width: 150 },
          other: { top: "20%", left: "50%", width: 200 },
        });
      // móviles pequeños
      else if (w < 768)
        setFrogSettings({
          register: { top: "25%", left: "50%", width: 150 },
          login: { top: "25%", left: "50%", width: 150 },
          other: { top: "30%", left: "50%", width: 250 },
        });
      // móviles / tablets pequenos
      else if (w < 1024)
        setFrogSettings({
          register: { top: "32%", left: "50%", width: 180 },
          login: { top: "33%", left: "50%", width: 180 },
          other: { top: "30%", left: "50%", width: 250 },
        });
      // tablets / pantallas medias
      else
        setFrogSettings({
          register: { top: "30%", left: "50%", width: 180 },
          login: { top: "30%", left: "50%", width: 180 },
          other: { top: "30%", left: "50%", width: 210 },
        }); // desktop
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleImageUpload = (imageFile) => {
    setProfileImage(imageFile); // Guardar imagen en el estado del padre
  };

  const showAlertMessage = (message) => {
    setShowAlert(message);
  };

  const handleNextStep = () => {
    showAlertMessage("");

    // Usuario y contraseña
    if (currentStep === 1) {
      setUsernameAttempt();
    }
    // Email
    else if (currentStep === 2) {
      setEmailAttempt(email);
      return;
    }
    // Código de verificación
    else if (currentStep === 3 && confirmationCode.length === 6) {
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

      setFrogSettings({
        ...frogSettings,
        register: {
          ...frogSettings.register,
          top:
            (parseInt(frogSettings.register.top.slice(0, 2)) - 4).toString() +
            "%",
        },
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowLoginForm(false);
      setShowRegisterForm(false);
      setUsername("");
      setPassword("");
      setEmail("");
      setConfirmationCode("");
      setLanguagesSpoken([]);
      setLanguagesLearning([]);
      setProfileImage(null);
    }
    showAlertMessage("");
  };

  const loginAttempt = async () => {
    if (!email) {
      showAlertMessage("Enter your email or nickname");
      return;
    } else if (!password) {
      showAlertMessage("...and what's your password?");
      return;
    }
    const result = await login({
      email: email,
      password: password,
    });
    if (result.status === 0) {
      sessionStorage.setItem("authToken", result.token);
      sessionStorage.setItem("userData", JSON.stringify(result.userData));

      // Subir imagen
      if (profileImage) {
        await uploadProfilePicture(profileImage);
      }
      router.push("../homepage");
    } else if (result.status > 0) {
      showAlertMessage(result.message);
    } else {
      showAlertMessage("Server is having trouble...");
    }
  };

  const registerAttempt = async () => {
    const result = await register({
      nickname: username,
      email: email,
      password: password,
      masterLanguage: languagesSpoken[0]?.name,
      masterLanguage2: null || languagesSpoken[1]?.name,
      masterLanguage3: languagesSpoken[2]?.name,
      learningLanguage: languagesLearning[0]?.name,
      learningLanguage2: languagesLearning[1]?.name,
      learningLanguage3: languagesLearning[2]?.name,
      picture: profileImage || null,
    });

    if (result.status === 0) {
      setShowRegisterForm(false);
      setShowLoginForm(true);
    } else {
      console.log(result);
      setShowAlert(result);
    }
  };

  const setUsernameAttempt = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }
    if (username.length < 5) {
      showAlertMessage("Username must be at least 5 characters long");
      return;
    }
    if (password.length < 8) {
      showAlertMessage("Password must be at least 8 characters long");
      return;
    }
    const inUse = await isUsernameInUse(username);
    if (inUse === -1) {
      showAlertMessage("Server is having trouble...");
      return;
    }
    if (inUse) {
      showAlertMessage("This nickname is taken!");
      return;
    }
    setUsername(username);
    setCurrentStep(currentStep + 1);
    return;
  };

  const setEmailAttempt = async (email) => {
    // Validación básica
    if (!email.trim() || !email.includes("@")) {
      showAlertMessage("Please enter a valid email address");
      return;
    }

    // Verificar si el email ya está en uso
    const inUse = await isEmailInUse(email);
    console.log("in use: ", inUse);
    if (inUse) {
      showAlertMessage("This email is taken!");
    } else if (inUse === -1) {
      showAlertMessage("Server is having trouble...");
    }

    // Si el email no está en uso, enviar el código de verificación
    else {
      setEmail(email);
      const res = await sendVerificationCode(email);
      if (res === 0) {
        setCurrentStep(currentStep + 1);
      } else {
        showAlertMessage("There was a problem validating your email");
        console.log("Problem validating email: " + res);
      }
    }
  };

  const checkCodeAttempt = async () => {
    const res = await checkVerificationCode(email, confirmationCode);
    if (res === 0) {
      setCurrentStep(currentStep + 1);
    } else {
      showAlertMessage(res);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] sm:h-screen relative">
      <motion.div
        src={showLoginForm ? "/logo-frog-open.png" : "/logo-frog-closed.png"}
        alt="Logo"
        href="/"
        className="w-40 z-99"
        animate={
          showLoginForm
            ? frogSettings.login
            : showRegisterForm
              ? frogSettings.register
              : frogSettings.other
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
      >
        <FrogAnimation toggle={showLoginForm} velocidad={50}></FrogAnimation>
      </motion.div>

      {!showLoginForm && !showRegisterForm && (
        <>
          <div className="text text-white text-lg">
            <h2 className="font-semibold text-2xl">Welcome to Letterex</h2>
            <Typewriter text={phrases} speed={100} loop={true} />
          </div>
          <div className="ctas">
            <motion.button
              className="btn-animated-form primary"
              onClick={() => {
                setShowLoginForm(true);
                setShowRegisterForm(false);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdOutlineSensorDoor />
              Log in
              <br></br>
            </motion.button>
            <motion.button
              className="btn-animated-form secondary gap-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowLoginForm(false);
                setShowRegisterForm(true);
              }}
            >
              <RiPlantLine />
              Register
            </motion.button>
          </div>
        </>
      )}

      {/* Formulario de inicio de sesión */}
      {showLoginForm && (
        <motion.div
          className="mt-10 bg-white p-6 rounded-lg shadow-lg w-80 w-[22rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-lg font-semibold mb-4">Log in</h2>
          <div className="flex flex-col gap-2 my-5 mx-0 justify-start">
            <input
              className="w-full p-2 mb-2 border rounded form-blank"
              type="text"
              placeholder="Email/Username"
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputPass
              styles="w-full p-0 mb-2 border rounded form-blank focus-visible:ring-[0px] text-gray-900"
              placeholder="Password"
              value={password}
              onChange={(pass) => {
                setPassword(pass);
                setShowAlert("");
              }}
              label={false}
              onEnter={loginAttempt}
            />
            <p style={{ whiteSpace: "pre-line" }} className="text-red-500">
              {showAlert}
            </p>
          </div>
          <div className="back-go">
            <button
              onClick={() => handlePrevStep()}
              className="w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-back"
            >
              ← Back
            </button>
            <button
              onClick={() => loginAttempt()}
              className="w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-go"
            >
              Go →
            </button>
          </div>
        </motion.div>
      )}

      {showRegisterForm && (
        <motion.div
          className="mt-10 bg-white p-6 rounded-lg shadow-lg min-w-[22rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Create your account
              </h2>
              <div className="flex flex-col gap-2 my-5 mx-0 justify-start">
                <input
                  className="w-full p-2 mb-2 border rounded form-blank"
                  type="text"
                  placeholder="Username"
                  value={username}
                  maxLength={20}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(
                      /[^a-zA-Z0-9_]/g,
                      "",
                    );
                    setUsername(filtered);
                    setShowAlert("");
                  }}
                />
                <InputPass
                  styles="w-full p-0 mb-2 border rounded form-blank focus-visible:ring-[0px] text-gray-900"
                  placeholder="Password"
                  value={password}
                  onChange={(pass) => {
                    setPassword(pass);
                    setShowAlert("");
                  }}
                  label={false}
                  maxLength={20}
                  type="login"
                  onEnter={handleNextStep}
                />
              </div>
              <p style={{ whiteSpace: "pre-line" }} className="text-red-500">
                {showAlert}
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-3 pb-0">
              <h2 className="text-lg font-semibold w-[20rem]">
                Enter an email 📫
              </h2>
              <input
                className="w-full p-2 mb-2 border rounded form-blank"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleNextStep();
                }}
              />
              <p style={{ whiteSpace: "pre-line" }} className="text-red-500">
                {showAlert}
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col p-4 gap-2 w-auto pb-0">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Check your mailbox📬
              </h3>
              <h4 className="text-lg mb-2">
                We sent you a verification code...
              </h4>
              <div className="flex gap-2 justify-center code">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    className="form-blank form-blank-code"
                    value={confirmationCode[index] || ""}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => {
                      showAlertMessage("");
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      const newCode = confirmationCode.split("");
                      newCode[index] = val;
                      setConfirmationCode(newCode.join(""));
                      // Solo avanza si se ha escrito un número
                      if (val && index < 5) {
                        inputRefs.current[index + 1]?.focus();
                      }
                      // Si es el último input, salta al botón
                      if (val && index === 5) {
                        document
                          .querySelector(".btn-animated-form.btn-go")
                          ?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Solo retrocede si se pulsa Backspace y el input está vacío
                      if (
                        e.key === "Backspace" &&
                        !confirmationCode[index] &&
                        index > 0
                      ) {
                        setTimeout(
                          () => inputRefs.current[index - 1]?.focus(),
                          0,
                        );
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData
                        .getData("Text")
                        .replace(/[^0-9]/g, "");
                      if (paste.length === 6) {
                        setConfirmationCode(paste);
                        // Opcional: mover el foco al último input
                        setTimeout(() => inputRefs.current[5]?.focus(), 0);
                        e.preventDefault();
                      }
                    }}
                  />
                ))}
              </div>
              <p className="text-red-500">{showAlert}</p>
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
                onSelectionChange={(selected) => setLanguagesSpoken(selected)}
              ></LanguageSelector>
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
                onSelectionChange={(selected) => setLanguagesLearning(selected)}
              ></LanguageSelector>
            </div>
          )}

          {currentStep === 6 && (
            <div className="flex flex-col gap-2 px-5 pt-4 w-[22rem]">
              <h2 className="text-lg font-semibold mb-4">
                {username}, this is your account
              </h2>
              <p className="text-center w-full"> 📫 {email} </p>
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
            </div>
          )}

          <div className="mt-4 flex justify-between back-go">
            {currentStep < 7 && (
              <motion.button
                className="p-2 bg-gray-500 text-white rounded btn-animated-form btn-back"
                onClick={handlePrevStep}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ← Back
              </motion.button>
            )}

            {currentStep < 6 ? (
              <motion.button
                className="p-2 bg-green-500 text-white rounded btn-animated-form btn-go"
                onClick={handleNextStep}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Next
              </motion.button>
            ) : currentStep === 6 ? (
              <motion.button
                className="p-2 bg-blue-500 text-white rounded btn-animated-form btn-finish"
                onClick={registerAttempt}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                All set ✓
              </motion.button>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  );
}

const LoginForm = (goBack) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState("");
  const btnClass =
    "w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-back";

  const loginAttempt = async () => {
    if (!email) {
      showAlertMessage("Enter your email or nickname");
      return;
    } else if (!password) {
      showAlertMessage("...and what's your password?");
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
      showAlertMessage(result.message);
    } else {
      showAlertMessage("Server is having trouble...");
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
      <div className="flex flex-col gap-2 my-5 mx-0 justify-start">
        <input
          className="w-full p-2 mb-2 border rounded form-blank"
          type="text"
          value={email}
          placeholder="Email/Username"
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputPass
          styles="w-full p-0 mb-2 border rounded form-blank focus-visible:ring-[0px] text-gray-900"
          placeholder="Password"
          value={password}
          onChange={(pass) => {
            setPassword(pass);
            setShowAlert("");
          }}
          label={false}
          onEnter={loginAttempt}
        />
        <p style={{ whiteSpace: "pre-line" }} className="text-red-500">
          {showAlert}
        </p>
      </div>
      <div className="back-go">
        <button onClick={goBack} className={btnClass}>
          ← Back
        </button>
        <button onClick={loginAttempt} className={btnClass}>
          Go →
        </button>
      </div>
    </motion.div>
  );
};

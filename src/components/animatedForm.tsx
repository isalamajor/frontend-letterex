"use client";

import "../stylesheets/animatedForm.css";
import { useState, useEffect } from "react";
import { MdOutlineSensorDoor } from "react-icons/md";
import { RiPlantLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { Typewriter } from "./ui/typeWriter";
import FrogAnimation from "@/components/frogAnimation1";
import RegisterForm from "./registerForm";
import LoginForm from "./loginForm";
import ResetPasswordForm from "./resetPasswordForm";

const phrases = [
  "Write about your passions",
  "Exchange language corrections",
  "Find people to share and learn",
];

export default function AnimatedForm() {
  const [formShowing, setFormShowing] = useState("HOME");
  const [toggleFrog, setToggleFrog] = useState(false);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] sm:h-screen relative">
      <motion.div
        className="w-40 z-99"
        animate={
          formShowing === "LOGIN" || formShowing === "RESET_PASSWORD"
            ? frogSettings.login
            : formShowing === "REGISTER"
              ? frogSettings.register
              : frogSettings.other
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
      >
        <FrogAnimation toggle={toggleFrog} velocidad={50} />
      </motion.div>

      {formShowing === "HOME" && (
        <HomeForm
          goLogin={() => {
            setFormShowing("LOGIN");
            setToggleFrog(!toggleFrog);
          }}
          goRegister={() => {
            setFormShowing("REGISTER");
            setToggleFrog(!toggleFrog);
          }}
        />
      )}

      {/* Formulario de inicio de sesión */}
      {formShowing === "LOGIN" && (
        <LoginForm
          goBack={() => {
            setFormShowing("HOME");
            setToggleFrog(!toggleFrog);
          }}
          goResetPassword={() => setFormShowing("RESET_PASSWORD")}
        />
      )}

      {/* Formulario de registro */}
      {formShowing === "REGISTER" && (
        <RegisterForm
          goBack={() => {
            setFormShowing("HOME");
            setToggleFrog(!toggleFrog);
          }}
          goLogin={() => setFormShowing("LOGIN")}
          moveFrog={() => {
            setFrogSettings({
              ...frogSettings,
              register: {
                ...frogSettings.register,
                top:
                  (
                    parseInt(frogSettings.register.top.slice(0, 2)) - 4
                  ).toString() + "%",
              },
            });
          }}
        />
      )}

      {/* Formulario de reset de contraseña */}
      {formShowing === "RESET_PASSWORD" && (
        <ResetPasswordForm goBack={() => setFormShowing("LOGIN")} />
      )}
    </div>
  );
}

const HomeForm = ({
  goRegister,
  goLogin,
}: {
  goRegister: () => void;
  goLogin: () => void;
}) => {
  return (
    <>
      <div className="text text-white text-lg">
        <h2 className="font-semibold text-2xl">Welcome to Letterex</h2>
        <span className="typewriter-frame">
          <Typewriter text={phrases} speed={100} loop={true} />
        </span>
      </div>
      <div className="ctas">
        <motion.button
          className="btn-animated-form primary"
          onClick={goLogin}
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
          onClick={goRegister}
        >
          <RiPlantLine />
          Register
        </motion.button>
      </div>
    </>
  );
};

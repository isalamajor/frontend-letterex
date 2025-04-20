"use client"; 

import "../stylesheets/animatedForm.css";
import { useState } from "react";
import { MdOutlineSensorDoor } from "react-icons/md";
import { RiPlantLine } from "react-icons/ri";
import { motion } from "framer-motion";
import TextAnimation from "./textAnimation";
import LanguageSelector from "./languageSelector";
import { login, register, isUsernameInUse,sendVerificationCode, isEmailInUse, checkVerificationCode } from "../services/api";
import ImageUploader from "./imageUploader";
import { useRouter } from "next/navigation"; 

const languagesData = [
  { name: "English", image: "/flags/english.png" },
  { name: "Spanish", image: "/flags/spanish.png" },
  { name: "French", image: "/flags/french.png" },
  { name: "Italian", image: "/flags/italian.png" },
  { name: "Portuguese", image: "/flags/portuguese.png" },
];

export default function AnimatedForm() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showAlert, setShowAlert] = useState("\n");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const [languagesLearning, setLanguagesLearning] = useState([]);
  const [profileImage, setProfileImage] = useState(null);


  const handleImageUpload = (imageFile) => {
    setProfileImage(imageFile); // Guardar imagen en el estado del padre
  };

  const phrases = [
    "Write about your passions",
    "Exchange language corrections",
    "Find people to share and learn"
  ];

  const showAlertMessage = (message) => {
    setShowAlert(message);

    // Restablecer la alerta a "" después de 3 segundos
    setTimeout(() => {
      setShowAlert("\n");
    }, 3000); // 3000 ms = 3 segundos
  };

  const handleNextStep = () => {

    console.log("test1x");
    if (currentStep === 1 && (!username.trim() || !password.trim())) {
      return;
    }
    else if (currentStep === 2 && (!email.trim() || !email.includes("@"))) {
      return;
    }
    else if (currentStep === 3 && confirmationCode.length < 6) {
      return;
    }
  
    // Si todas las validaciones pasan, avanzar al siguiente paso
    if (currentStep == 2) {
      setEmailAttempt(email);
    }
    else if (currentStep == 3) {
      checkCodeAttempt();    
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };
  

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowForm(false);
      setUsername('');
      setPassword('');
      setEmail('');
      setConfirmationCode('');
      setLanguagesSpoken([]);
      setLanguagesLearning([]);
      setProfileImage(null);
      setShowRegisterForm(false);
    }
  };

  const handleAddLanguage = (setLanguageState, languagesList) => {
    if (languagesList.length < 3) {
      setLanguageState([...languagesList, '']);
    }
  };

  const loginAttempt = async() => {
    
    if (!email) { showAlertMessage("Enter your email"); return }
    else if (!password) { showAlertMessage("...and what's your password?"); return }
    const result = await login({
      email: email,
      password: password
    });
    if (result.status === 0) { router.push("../homepage"); /*logear, recibe user y token*/}
    else if (result.status > 0) { showAlertMessage(result.message) }
    else { showAlertMessage("Server is having trouble...") }
    console.log(result);
  }

  const registerAttempt = async() => {
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
      picture: profileImage || null
    })

    if (result.status === 0) {console.log(result); setShowRegisterForm(false); setShowForm(true);} 
  }

  const setUsernameAttempt = async(username) => {
    const inUse = await isUsernameInUse(username);
    if (inUse) {
      showAlertMessage("This nickname is taken!")
    } else {
      setUsername(username)
    }
  }

  const setEmailAttempt = async(email) => {
    const inUse = await isEmailInUse(email);
    console.log("in use: " + inUse);
    if (inUse) {
      showAlertMessage("This email is taken!")
    } else if (inUse === -1) {
      showAlertMessage("Server is having trouble...")
    }
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
  }

  const checkCodeAttempt = async() => {
    const res = await checkVerificationCode(email, confirmationCode);
    if (res === 0) {
      setCurrentStep(currentStep + 1);
    } else {
      showAlertMessage(res);
      console.log("Problem validating code: " + res);
    }
  }

  console.log(showRegisterForm);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.img
        src="/logofrog.png"
        alt="Logo"
        className="w-40"
        animate={showForm ? {  top: "29%", left: "49%", width: 150 } : showRegisterForm ? {  top: "29%", left: "49%", width: 150 }: { top: "29%", left: "49%", width: 150 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
      />

      {!showForm && !showRegisterForm && (
        <div>
          <div className="text text-white text-lg">
            <h2>Welcome to Letterex</h2>
            <TextAnimation phrases={phrases} />
          </div>
          <div className="ctas">
            <motion.button
              className="btn-animated-form primary"
              onClick={() => {setShowForm(true); setShowRegisterForm(false);}}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdOutlineSensorDoor />
              Log in
              <br></br>
            </motion.button>
            <motion.button
              className="btn-animated-form secondary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {setShowForm(false); setShowRegisterForm(true);}}
            >
              <RiPlantLine />
              Register
            </motion.button>
          </div>
        </div>
      )}

      {/* Formulario de inicio de sesión */}
      {showForm && (
        <motion.div
          className="mt-10 bg-white p-6 rounded-lg shadow-lg w-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-lg font-semibold mb-4">Log in</h2>
          <div className="grid-form">
            <input
              className="w-full p-2 mb-2 border rounded form-blank"
              type="text"
              placeholder="Email/Username"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full p-2 mb-2 border rounded form-blank"
              type="email"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <p style={{ whiteSpace: "pre-line" }}>{showAlert}</p>
          </div>
          <div className="back-go">
            <button
              onClick={() => setShowForm(false)}
              className="w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-back"
            >
              ← Back
            </button>
            <button 
              onClick={() => loginAttempt()}
              className="w-full p-2 bg-green-500 text-white rounded btn-animated-form btn-go">
              Go →
            </button>
          </div>
        </motion.div>
      )}


      {showRegisterForm && (
        <motion.div
            className="mt-10 bg-white p-6 rounded-lg shadow-lg w-80 slide-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Create your account</h2>
              <div className="form-register">
                <input
                    className="w-full p-2 mb-2 border rounded form-blank"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="w-full p-2 mb-2 border rounded form-blank"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="slide-form">
              <h2 className="text-lg font-semibold mb-4">Enter an email 📫</h2>
              <input
                className="w-full p-2 mb-2 border rounded form-blank"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="slide-form">
              <h3 className="text-lg font-semibold mb-4 text-center">Check your mailbox📬</h3>
              <h4 className="text-lg font-semibold mb-4">We sent you a verification code...</h4>
              <div className="flex gap-2 justify-center code">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="form-blank form-blank-code"
                    value={confirmationCode[index] || ''}
                    onChange={(e) => {
                      const newCode = confirmationCode.split('');
                      newCode[index] = e.target.value;
                      setConfirmationCode(newCode.join(''));
                    }}
                  />
                ))}
              </div>
            </div>
          )}


          {currentStep === 4 && (
            <div className="slide-form">
                
              <LanguageSelector
              languagesAvailable={languagesData.filter(lang => !languagesSpoken.includes(lang))}
              languagesTaken={languagesSpoken} 
              titleText="Select the languages you master"
              noneText="what will it be?" 
              tooManyText="Three is enough don't be cocky!"
              onSelectionChange={(selected) => setLanguagesSpoken(selected)}></LanguageSelector>
            </div>
          )}

          {currentStep === 5 && (
            <div className="slide-form">
              <LanguageSelector
              languagesAvailable={languagesData.filter(lang => !languagesSpoken.includes(lang))}  
              languagesTaken={languagesLearning} 
              titleText="Select the languages you are learning"
              noneText="...or don't choose any" 
              tooManyText="Why so ambitious? Let's set a goal of 3 languages"
              onSelectionChange={(selected) => setLanguagesLearning(selected)}></LanguageSelector>
              
            </div>
          )}

          {currentStep === 6 && (
            <div className="slide-form">
              <h2 className="text-lg font-semibold mb-4">{username}, this is your account</h2>
              <p> 📫 {email} </p>
              <div className="two-columns-profile">
                <div className="languages-profile">
                  <strong>Mastering</strong> 
                  <div className="languages-list-profile">
                    {languagesSpoken.map((lang => (
                      <motion.img
                      key={lang.name}
                      src={lang.image}
                      alt={lang.name}
                      className="cursor-pointer rounded-full border border-gray-300 shadow"
                      style={{ width: "2rem", height: "2rem" }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleSelectLanguage(lang)}
                    />
                    )))} 
                  </div>
                  <strong>Learning</strong>
                  <div className="languages-list-profile">
                    {languagesLearning.map((lang => (
                      <motion.img
                      key={lang.name}
                      src={lang.image}
                      alt={lang.name}
                      className="cursor-pointer rounded-full border border-gray-300 shadow"
                      style={{ width: "2rem", height: "2rem" }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleSelectLanguage(lang)}
                    />
                    )))}
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
            ): null}

          </div>
        </motion.div>
      )}
    </div>
  );
}

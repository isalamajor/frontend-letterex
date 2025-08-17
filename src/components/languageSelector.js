import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import '../stylesheets/languageSelector.css';


export default function LanguageSelector({ languagesAvailable, languagesTaken, noneText, tooManyText, titleText, onSelectionChange }) {
  const [selectedLanguages, setSelectedLanguages] = useState(languagesTaken);
  const [availableLanguages, setAvailableLanguages] = useState(languagesAvailable);
  const [maxReached, reachMax] = useState(false);

  useEffect(() => {
    // Llamar a la función del componente padre cuando cambien los idiomas seleccionados
    onSelectionChange(selectedLanguages);
  }, [selectedLanguages, onSelectionChange]);

  const handleSelectLanguage = (language) => {
    if (selectedLanguages.length < 3) {
      setSelectedLanguages([...selectedLanguages, language]);
      setAvailableLanguages(availableLanguages.filter((lang) => lang.name !== language.name));
    } else {
      reachMax(true);
    }
  };

  const handleDeselectLanguage = (language) => {
    if (selectedLanguages.length === 3) {
      reachMax(false);
    }
    setAvailableLanguages([...availableLanguages, language]);
    setSelectedLanguages(selectedLanguages.filter((lang) => lang.name !== language.name));
  };

  return (
    <div className="flex flex-col items-center main">
      <h2 className="text-lg font-semibold mb-4">{titleText}</h2>
      <div className="grid grid-cols-5 gap-2">
        {availableLanguages.map((lang) => (
          <motion.img
            key={lang.name}
            src={lang.image}
            alt={lang.name}
            className="cursor-pointer rounded-full border border-gray-300 shadow"
            style={{ width: "2rem", height: "2rem" }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleSelectLanguage(lang)}
          />
        ))}
      </div>

      {selectedLanguages.length === 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 no-language">{noneText}</h2>
          <div className="pic-vacio"></div>
        </div>
      )}
      {selectedLanguages.length > 0 && (
        <div className="selected-languages">
          {!maxReached && <h2 className="text-lg font-semibold mb-2">Here they are :)</h2>}
          {maxReached && <h3 className="text-lg font-semibold mb-2">{tooManyText}</h3>}
          <div className="grid-languages grid-selected">
            {selectedLanguages.map((lang) => (
              <motion.img
                key={lang.name}
                src={lang.image}
                alt={lang.name}
                className="cursor-pointer rounded-full border border-gray-300 shadow w-2 h-2 "
                style={{ width: "2rem", height: "2rem" }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleDeselectLanguage(lang)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

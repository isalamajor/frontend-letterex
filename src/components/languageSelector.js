import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../stylesheets/languageSelector.css";

export default function LanguageSelector({
  languagesAvailable,
  languagesTaken,
  noneText,
  tooManyText,
  titleText,
  onSelectionChange,
}) {
  const [selectedLanguages, setSelectedLanguages] = useState(languagesTaken);
  const [availableLanguages, setAvailableLanguages] =
    useState(languagesAvailable);
  const [maxReached, reachMax] = useState(false);

  useEffect(() => {
    // Call the parent component function when selected languages change
    onSelectionChange(selectedLanguages);
  }, [selectedLanguages, onSelectionChange]);

  const handleSelectLanguage = (language) => {
    if (selectedLanguages.length < 3) {
      setSelectedLanguages([...selectedLanguages, language]);
      setAvailableLanguages(
        availableLanguages.filter((lang) => lang.name !== language.name),
      );
    } else {
      reachMax(true);
    }
  };

  const handleDeselectLanguage = (language) => {
    if (selectedLanguages.length === 3) {
      reachMax(false);
    }
    setAvailableLanguages([...availableLanguages, language]);
    setSelectedLanguages(
      selectedLanguages.filter((lang) => lang.name !== language.name),
    );
  };

  return (
    <div className="flex flex-col items-center fit-content">
      <h2 className="text-lg font-semibold mb-4">{titleText}</h2>
      <div className="grid grid-cols-7 gap-2 h-[5rem]">
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
        <div className="h-[5rem]">
          <h2 className="text-lg font-semibold mt-2">{noneText}</h2>
        </div>
      )}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-col justify-end h-[5rem] w-full text-right">
          <h2 className="text-lg font-semibold mt-2 mb-2 max-w-[22rem]">
            {maxReached ? tooManyText : "Here they are :)"}
          </h2>
          <div className="flex flex-row gap-2 justify-end">
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

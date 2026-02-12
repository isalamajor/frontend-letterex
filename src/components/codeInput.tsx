import { useState, useRef } from "react";

const CodeInput = ({ setCode }: { setCode: (inputCode: string) => void }) => {
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSetCode = (input: string) => {
    setCode(input);
    setConfirmationCode(input);
  };

  return (
    <div className="flex gap-2 justify-center code">
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="form-blank form-blank-code"
          value={confirmationCode[index] || ""}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            const newCode = confirmationCode.split("");
            newCode[index] = val;
            handleSetCode(newCode.join(""));
            // Solo avanza si se ha escrito un número
            if (val && index < 5) {
              inputRefs.current[index + 1]?.focus();
            }
            // Si es el último input, salta al botón
            if (val && index === 5) {
              (
                document.querySelector(
                  ".btn-animated-form.btn-go",
                ) as HTMLElement
              )?.focus();
            }
          }}
          onKeyDown={(e) => {
            // Solo retrocede si se pulsa Backspace y el input está vacío
            if (
              e.key === "Backspace" &&
              !confirmationCode[index] &&
              index > 0
            ) {
              setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
            }
          }}
          onPaste={(e) => {
            const paste = e.clipboardData
              .getData("Text")
              .replace(/[^0-9]/g, "");
            if (paste.length === 6) {
              handleSetCode(paste);
              // Mover el foco al último input
              setTimeout(() => inputRefs.current[5]?.focus(), 0);
              e.preventDefault();
            }
          }}
        />
      ))}
    </div>
  );
};

export default CodeInput;

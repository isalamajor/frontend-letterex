import { useState, useEffect } from 'react';

const TextAnimation = ({ phrases }) => {
  const [currentText, setCurrentText] = useState('');
  const [index, setIndex] = useState(0);
  const [writing, setWriting] = useState(true);  // Control para saber si estamos escribiendo o borrando
  const [charIndex, setCharIndex] = useState(0);  // Índice de caracteres de la frase actual
  const [cursorVisible, setCursorVisible] = useState(true);  // Para alternar la visibilidad del cursor
  const [delay, setDelay] = useState(0); // Para gestionar el retraso al final de la frase

  useEffect(() => {
    let interval;
    const cursorBlinkInterval = setInterval(() => {
      setCursorVisible((prev) => !prev); // Hace parpadear el cursor
    }, 500); // El cursor parpadea cada 500ms

    const writeText = () => {
      if (charIndex < phrases[index].length) {
        setCurrentText((prev) => prev + phrases[index][charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        setWriting(false);  // Cambiar a borrar cuando termina de escribir
        setDelay(1000);  // Establecer retraso de 1 segundo después de escribir la frase
      }
    };

    const eraseText = () => {
      if (charIndex > 0) {
        setCurrentText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else {
        setWriting(true);  // Cambiar a escribir cuando termina de borrar
        setIndex((prevIndex) => (prevIndex + 1) % phrases.length);  // Cambiar de frase
        setDelay(0);  // Resetear el retraso cuando comienza la siguiente frase
      }
    };

    // Si estamos entre frases (sin ningún carácter escrito o borrado), mostrar un espacio
    if (!currentText && !writing && delay === 0) {
      setCurrentText('\n');  // Mostrar el espacio entre frases (4 espacios en lugar de 1)
    }

    // Ejecutar la escritura o borrado según el estado de `writing`
    if (writing) {
      interval = setInterval(writeText, 100);  // Escribir texto cada 100ms
    } else if (delay === 0) {
      interval = setInterval(eraseText, 50);  // Borrar texto cada 50ms
    } else {
      // Si hemos alcanzado el retraso, se mantiene la frase visible
      setTimeout(() => {
        setDelay(0);  // Resetear el retraso
      }, delay);
    }

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(interval);
      clearInterval(cursorBlinkInterval); // Limpiar el intervalo del cursor
    };
  }, [writing, charIndex, index, phrases, currentText, delay]);

  return (
    <div className="text-animation">
      {currentText}
      {cursorVisible && <span className="cursor">|</span>}  {/* El cursor */}
    </div>
  );
};

export default TextAnimation;

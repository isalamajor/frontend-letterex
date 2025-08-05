const TextCorrections = ({ text, corrections, onCorrectionClick }: {
    text: string;
    corrections: {
      textOriginal: string;
      textCorrected: string;
      startIndex: number;
      endIndex: number;
    }[];
    onCorrectionClick: (correction: {
      textOriginal: string;
      textCorrected: string;
      startIndex: number;
      endIndex: number;
    },
    rect:DOMRect) => void;
  }) => {
    // Ordenar por inicio para evitar conflictos
    const ordered = [...corrections].sort((a, b) => a.startIndex - b.startIndex);
    const fragments = [];
    let currentIndex = 0;

  
    for (const correcion of ordered) {
      const { textCorrected, startIndex, endIndex } = correcion;
  
      // Añadir text antes de la corrección
      if (currentIndex < startIndex) {
        fragments.push(
          <span key={currentIndex}>{text.slice(currentIndex, startIndex)}</span>
        );
      }
  
      // Añadir text corregido subrayado en rojo
      fragments.push(
        <span
          id={`correction-${startIndex}-${endIndex}`}
          key={startIndex}
          className="underline decoration-red-500 decoration-2 hover:bg-yellow-200 cursor-pointer"
          title={`${textCorrected}`}
          onClick={() => {
            const element = document.getElementById(`correction-${startIndex}-${endIndex}`);
            if (!element) return;
            const rect = element.getBoundingClientRect()
            onCorrectionClick(correcion, rect)
          }}
        >
          {text.slice(startIndex, endIndex)}
        </span>
      );
  
      currentIndex = endIndex;
    }
  
    // Añadir el resto del text
    if (currentIndex < text.length) {
      fragments.push(
        <span key={currentIndex}>{text.slice(currentIndex)}</span>
      );
    }
  
    return (
    <p>{fragments}</p>
    );
  };
  

export default TextCorrections;
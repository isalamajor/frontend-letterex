import React, { forwardRef, useMemo } from "react";

interface Correction {
  textOriginal: string;
  textCorrected: string;
  startIndex: number;
  endIndex: number;
}

const TextCorrections = forwardRef<
  HTMLDivElement,
  {
    text: string;
    corrections: Correction[];
    onCorrectionClick: (correction: Correction, rect: DOMRect) => void;
  }
>(({ text, corrections, onCorrectionClick }, ref) => {
  const processedContent = useMemo(() => {
    if (!text) return "";

    // Function to extract plain text maintaining order
    const extractPlainText = (
      html: string,
    ): {
      text: string;
      map: Array<{ plainIndex: number; htmlIndex: number }>;
    } => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
      );

      let plainText = "";
      const indexMap = [];
      let node;

      while ((node = walker.nextNode())) {
        const nodeText = node.textContent || "";
        const nodeStart = html.indexOf(
          nodeText,
          indexMap.length > 0 ? indexMap[indexMap.length - 1].htmlIndex : 0,
        );

        for (let i = 0; i < nodeText.length; i++) {
          indexMap.push({
            plainIndex: plainText.length + i,
            htmlIndex: nodeStart + i,
          });
        }
        plainText += nodeText;
      }

      return { text: plainText, map: indexMap };
    };

    // Function to insert correction in HTML preserving structure
    const insertCorrectionInHtml = (
      html: string,
      correction: Correction,
      plainToHtmlMap: Array<{ plainIndex: number; htmlIndex: number }>,
    ) => {
      const { textOriginal, textCorrected, startIndex, endIndex } = correction;

      // Encontrar posiciones HTML correspondientes
      const startHtmlIndex = plainToHtmlMap.find(
        (m) => m.plainIndex === startIndex,
      )?.htmlIndex;
      const endHtmlIndex = plainToHtmlMap.find(
        (m) => m.plainIndex === endIndex - 1,
      )?.htmlIndex;

      if (startHtmlIndex === undefined || endHtmlIndex === undefined) {
        return html; // No se pudo mapear, devolver HTML original
      }

      // Buscar el texto original en el HTML
      const searchStart = startHtmlIndex;
      let actualStart = -1;

      // Search backwards and forwards to find the exact text
      for (let offset = 0; offset <= 50; offset++) {
        // Search backwards
        if (searchStart - offset >= 0) {
          const index = html.indexOf(textOriginal, searchStart - offset);
          if (index !== -1 && index <= startHtmlIndex + 10) {
            actualStart = index;
            break;
          }
        }

        // Buscar hacia adelante
        if (searchStart + offset < html.length) {
          const index = html.indexOf(textOriginal, searchStart + offset);
          if (index !== -1 && index <= startHtmlIndex + 50) {
            actualStart = index;
            break;
          }
        }
      }

      if (actualStart === -1) {
        return html; // Text not found
      }

      const beforeHtml = html.substring(0, actualStart);
      const afterHtml = html.substring(actualStart + textOriginal.length);

      const correctionSpan = `<span
        id="correction-${startIndex}-${endIndex}"
        class="underline decoration-red-500 decoration-2 hover:bg-yellow-200 dark:hover:text-gray-900 cursor-pointer relative"
        title="Sugerencia: ${textCorrected.replace(/"/g, "&quot;")}"
        data-correction="${encodeURIComponent(JSON.stringify(correction))}"
      >${textOriginal}</span>`;

      return beforeHtml + correctionSpan + afterHtml;
    };

    // Procesar el HTML
    const { text: plainText, map } = extractPlainText(text);
    let processedHtml = text;

    // Sort corrections backwards to forwards to maintain indices
    const orderedCorrections = [...corrections].sort(
      (a, b) => b.startIndex - a.startIndex,
    );

    // Apply each correction
    for (const correction of orderedCorrections) {
      if (
        correction.startIndex < plainText.length &&
        correction.endIndex <= plainText.length
      ) {
        processedHtml = insertCorrectionInHtml(processedHtml, correction, map);
      }
    }

    return processedHtml;
  }, [text, corrections]);

  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const correctionElement = target.closest("[data-correction]");

    if (correctionElement) {
      const correctionData = correctionElement.getAttribute("data-correction");
      if (correctionData) {
        try {
          const correction = JSON.parse(decodeURIComponent(correctionData));
          const rect = correctionElement.getBoundingClientRect();
          onCorrectionClick(correction, rect);
        } catch (error) {
          console.error("Error parsing correction data:", error);
        }
      }
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: processedContent }}
      className="prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_strong]:font-bold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
    />
  );
});

TextCorrections.displayName = "TextCorrections";

export default TextCorrections;

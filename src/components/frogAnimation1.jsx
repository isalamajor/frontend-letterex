"use client";

import { useState, useEffect } from "react";

export default function FrogAnimation({ toggle, velocidad = 150 }) {
  
    const frames = [
    "/logo-frog-1.png",
    "/logo-frog-2.png",
    "/logo-frog-3.png",
    "/logo-frog-4.png",
  ];
  const [init, setInit] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (init) {setInit(false); return;}
    // Decidir secuencia según el frame actual
    const goOpen = frameIndex === 0;

    let i = goOpen ? 0 : frames.length - 1;
    const interval = setInterval(() => {
      setFrameIndex(i);
      if (goOpen) {
        i++;
        if (i >= frames.length) clearInterval(interval);
    } else {
        i--
        if (i < 0) clearInterval(interval)
    };
    }, velocidad);

    return () => clearInterval(interval);
  }, [toggle]);

  // Mostrar el frame correcto
  const displayFrame = frameIndex < frames.length ? frames[frameIndex] : frames[frames.length - 1];

  return (
      <img
        src={displayFrame}
        alt="Logo Frog"
      />
  );
}

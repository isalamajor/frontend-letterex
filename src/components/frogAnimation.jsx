"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function FrogAnimation({ toggle, velocidad = 150 }) {
  const frames = [
    "/logo-frog-1.png",
    "/logo-frog-2.png",
    "/logo-frog-3.png",
    "/logo-frog-4.png",
  ];
  const [init, setInit] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (init) {
      setInit(false);
      return;
    }
    // Decide sequence based on current frame
    const goOpen = frameIndex === 0;

    let i = goOpen ? 0 : frames.length - 1;
    const interval = setInterval(() => {
      setFrameIndex(i);
      if (goOpen) {
        i++;
        if (i >= frames.length) clearInterval(interval);
      } else {
        i--;
        if (i < 0) clearInterval(interval);
      }
    }, velocidad);

    return () => clearInterval(interval);
  }, [toggle, velocidad]);

  // Mostrar el frame correcto
  const safeFrameIndex = Math.max(0, Math.min(frameIndex, frames.length - 1));
  const displayFrame = frames[safeFrameIndex] || frames[0];
  console.log("frame", displayFrame);

  if (imageFailed) {
    return null;
  }

  return (
    <div style={{ width: 150, height: 150 }} className="relative">
      <Image
        src={displayFrame}
        alt="logo-frog"
        fill
        className="object-contain"
        draggable={false}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

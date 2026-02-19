"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageZoom({
  src,
  className,
  alt,
}: {
  src: string;
  className: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.img
        src={src}
        alt="preview"
        onClick={() => setIsOpen(true)}
        style={{ cursor: "pointer" }}
        className={className}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{ maxWidth: "80%", maxHeight: "80%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

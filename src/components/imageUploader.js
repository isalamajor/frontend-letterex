import React, { useState } from "react";

const ImageUploader = ({ onImageSelect }) => {
  const [profileImage, setProfileImage] = useState(null);
  const defaultImage = "/defaultpp.webp"; // Imagen por defecto

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      onImageSelect(file); // Enviar imagen al padre
    } else {
      alert("Por favor, selecciona una imagen válida");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "125px",
        height: "125px",
        borderRadius: "50%",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={() => document.getElementById("fileInput").click()} // Hacer clic en la imagen abre el input
    >
      {/* Imagen de perfil */}
      <img
        src={profileImage || defaultImage}
        alt="Imagen de perfil"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "50%",
          border: "2px solid #ccc",
          transition: "opacity 0.3s ease-in-out",
        }}
      />

      {/* Capa oscura y texto al hacer hover */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Oscurecer imagen
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: "bold",
          opacity: 0, // Oculto por defecto
          transition: "opacity 0.3s ease-in-out",
          borderRadius: "50%",
        }}
        className="hover-overlay"
      >
        Select picture
      </div>
        <p>HOLA</p>
      {/* Input oculto */}
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ImageUploader;

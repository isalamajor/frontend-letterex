import React, { useState, ChangeEvent, useEffect } from "react";
import { FolderUp } from "lucide-react";
import { Trash2 } from "lucide-react";
import ImageZoom from "./zoomImage";
import { useDialog } from "@/context/dialogContext";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  onImageRemove?: () => void;
  currentPicLocalUrl?: string | null;
  size?: string | null;
  active?: boolean | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onImageRemove,
  currentPicLocalUrl = null,
  size = "125px",
  active = true,
}) => {
  const { openDialog } = useDialog();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState<string | null>(null);
  const defaultImage = "/default.png";
  const normalizedCurrentPic =
    currentPicLocalUrl === "default.png" ? "/default.png" : currentPicLocalUrl;

  useEffect(() => {
    if (!active) {
      setProfileImage(null);
      setImageRemoved(null);
      onImageSelect(null);
    }
  }, [active, onImageSelect]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!active) return;
    const file = e.target.files?.[0] ?? null;

    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setImageRemoved(null);
      onImageSelect(file);
    } else {
      openDialog({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        primaryActionText: "OK",
        autoDismiss: false,
        size: "sm",
        type: "error",
      });
    }
  };
  console.log(profileImage, imageRemoved, normalizedCurrentPic, defaultImage);

  return (
    <div className="flex flex-col justify-center items-center">
      <div
        className="relative rounded-full overflow-hidden cursor-pointer group mr-2"
        style={{ height: size ?? "", width: size ?? "" }}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <ImageZoom
          src={
            profileImage ??
            imageRemoved ??
            normalizedCurrentPic ??
            "/default.png"
          }
          alt="Error al cargar la imagen :("
          className="w-full h-full object-cover rounded-full border-2 border-gray-200 transition-opacity duration-300"
        />
        {/* overlay */}
        {active && (
          <div className="absolute inset-0 hover:bg-black/50 text-white flex items-center justify-center text-sm font-bold opacity-0 transition-opacity duration-300 rounded-full group-hover:opacity-100">
            <FolderUp size={70} />
          </div>
        )}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={!active}
        />
      </div>
      {active && (
        <p
          className="text-red-500 flex flex-row gap-1 justify-center items-center mt-2 hover:underline underline-2 cursor-pointer"
          onClick={() => {
            setProfileImage(null);
            onImageSelect(null);
            setImageRemoved("/default.png");
            onImageRemove?.();
          }}
        >
          <Trash2 size={20} />
          Remove
        </p>
      )}
    </div>
  );
};

export default ImageUploader;

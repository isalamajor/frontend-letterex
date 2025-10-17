import React, { useState, ChangeEvent, useEffect, use } from "react";
import { FolderUp } from "lucide-react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  currentPicLocalUrl?: string | null;
  size?: string | null;
  active?: boolean | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  currentPicLocalUrl = null,
  size = "125px",
  active = true,
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState<string | null>(null);
  const defaultImage = "/default.png";

  useEffect(() => {
    setImageRemoved(null);
  }, [active])

  // Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    primaryActionText: string
    autoDismiss: boolean
    size: 'sm' | 'md' | 'lg'
    type: DialogType
  }>({
    isOpen: false,
    title: "Payment Successful!",
    description: "Your payment has been processed successfully. You will receive a confirmation email shortly.",
    primaryActionText: "View Receipt",
    autoDismiss: false,
    size: 'md',
    type: 'success'
  })

  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig(prev => ({ ...prev, ...config, isOpen: true }))
  }

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }))
  }

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

  return (
    <div> 
      <div
        className="relative rounded-full overflow-hidden cursor-pointer group"
        style={{ height: size ?? "125px", width: size ?? "125px" }}
        onClick={() => document.getElementById("fileInput")?.click()}
      > 
        <img
          src={profileImage ?? imageRemoved ?? currentPicLocalUrl ?? defaultImage}
          alt="Imagen de perfil"
          className="w-full h-full object-cover rounded-full border-2 border-gray-300 transition-opacity duration-300"
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
      
        
        <SuccessDialog
          isOpen={dialogConfig.isOpen}
          title={dialogConfig.title ?? undefined}
          description={dialogConfig.description ?? undefined}
          primaryActionText={dialogConfig.primaryActionText ?? undefined}
          onClose={closeDialog}
          type={dialogConfig.type}
        />
      </div>
      {active && 
        <p className="text-red-500 flex flex-row gap-1 justify-center items-center mt-2 hover:underline underline-2 cursor-pointer" onClick={() => {
        setProfileImage(null); onImageSelect(null); setImageRemoved("/default.png") }}><Trash2 size={20}/>Remove</p> 
      }
    </div>
  );
};

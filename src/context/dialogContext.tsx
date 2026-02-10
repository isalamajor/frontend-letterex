import React, { createContext, useContext, useState, ReactNode } from "react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";

type DialogSize = "sm" | "md" | "lg";

type DialogConfig = {
  isOpen: boolean;
  title: string;
  description: string;
  primaryActionText: string;
  autoDismiss: boolean;
  autoDismissDelay?: number;
  size: DialogSize;
  type: DialogType;
};

const defaultConfig: DialogConfig = {
  isOpen: false,
  title: "",
  description: "",
  primaryActionText: "OK",
  autoDismiss: true,
  autoDismissDelay: 2000,
  size: "md",
  type: "success",
};

const DialogContext = createContext<{
  openDialog: (cfg: Partial<DialogConfig>) => void;
  closeDialog: () => void;
}>({
  openDialog: () => {},
  closeDialog: () => {},
});

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DialogConfig>(defaultConfig);

  const openDialog = (cfg: Partial<DialogConfig>) =>
    setConfig((prev) => ({ ...prev, ...cfg, isOpen: true }));

  const closeDialog = () => setConfig((prev) => ({ ...prev, isOpen: false }));

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <SuccessDialog
        isOpen={config.isOpen}
        onClose={closeDialog}
        title={config.title}
        description={config.description}
        primaryActionText={config.primaryActionText}
        autoDismiss={config.autoDismiss}
        autoDismissDelay={config.autoDismissDelay}
        size={config.size}
        type={config.type}
      />
    </DialogContext.Provider>
  );
};
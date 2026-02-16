"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";

type DialogSize = "sm" | "md" | "lg";

const defaultConfig: DialogConfig = {
  isOpen: false,
  title: "All done!",
  description: "Action performed successfully",
  primaryActionText: "OK",
  autoDismiss: true,
  autoDismissDelay: 6000,
  size: "md",
  type: "success",
};

type DialogConfig = {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  description: string;
  primaryActionText: string;
  onPrimaryAction?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  showCloseButton?: boolean;
  size: "sm" | "md" | "lg";
  type: DialogType;
  letterId?: string;
  sharedWith?: string[];
  onShareSuccess?: (shareLetterResult: number) => void;
  onNewDiaryCreated?: (diaryName: string) => void;
  prevNewDiaryName?: string;
  onConfirmationPositive?: () => void | Promise<void>;
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

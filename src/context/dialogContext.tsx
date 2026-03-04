"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { DialogConfig } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const SuccessDialog = dynamic(() => import("@/components/ui/dialog"), {
  ssr: false,
  loading: () => null,
});

const defaultConfig: DialogConfig = {
  isOpen: false,
  primaryActionText: "OK",
  autoDismiss: true,
  autoDismissDelay: 6000,
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

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DialogConfig>(defaultConfig);

  const closeDialog = () => setConfig((prev) => ({ ...prev, isOpen: false }));

  const openDialog = (cfg: Partial<DialogConfig>) =>
    setConfig((prev) => ({
      ...prev,
      ...cfg,
      isOpen: true,
      onClose: closeDialog,
    }));

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <SuccessDialog
        isOpen={config.isOpen}
        onClose={config.onClose}
        title={config.title}
        description={config.description}
        primaryActionText={config.primaryActionText}
        onPrimaryAction={config.onPrimaryAction}
        letterId={config.letterId}
        sharedWith={config.sharedWith}
        onShareSuccess={config.onShareSuccess}
        autoDismiss={config.autoDismiss}
        autoDismissDelay={config.autoDismissDelay}
        showCloseButton={config.showCloseButton}
        size={config.size}
        type={config.type}
        onNewDiaryCreated={config.onNewDiaryCreated}
        prevNewDiaryName={config.prevNewDiaryName}
        onConfirmationPositive={config.onConfirmationPositive}
      />
    </DialogContext.Provider>
  );
};

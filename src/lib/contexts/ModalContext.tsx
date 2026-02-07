"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ModalState {
  authModal: boolean;
  externalLink: { isOpen: boolean; url: string; siteName: string };
}

interface ModalContextType {
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openExternalLink: (url: string, siteName: string) => void;
  closeExternalLink: () => void;
  state: ModalState;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({
    authModal: false,
    externalLink: { isOpen: false, url: "", siteName: "" },
  });

  const openAuthModal = useCallback(() =>
    setState(s => ({ ...s, authModal: true })), []);
  const closeAuthModal = useCallback(() =>
    setState(s => ({ ...s, authModal: false })), []);
  const openExternalLink = useCallback((url: string, siteName: string) =>
    setState(s => ({ ...s, externalLink: { isOpen: true, url, siteName } })), []);
  const closeExternalLink = useCallback(() =>
    setState(s => ({ ...s, externalLink: { isOpen: false, url: "", siteName: "" } })), []);

  return (
    <ModalContext.Provider value={{ state, openAuthModal, closeAuthModal, openExternalLink, closeExternalLink }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}

"use client";

import dynamic from "next/dynamic";
import { useModals } from "@/lib/contexts/ModalContext";
import { ExternalLinkModal } from "@/components/ui/ExternalLinkModal";

const AuthModal = dynamic(
  () => import("@/components/auth/AuthModal").then(mod => ({ default: mod.AuthModal })),
  { ssr: false }
);

export function GlobalModals() {
  const { state, closeAuthModal, closeExternalLink } = useModals();

  return (
    <>
      <AuthModal isOpen={state.authModal} onClose={closeAuthModal} />
      <ExternalLinkModal
        isOpen={state.externalLink.isOpen}
        onClose={closeExternalLink}
        onConfirm={() => {
          window.open(state.externalLink.url, "_blank", "noopener,noreferrer");
          closeExternalLink();
        }}
        url={state.externalLink.url}
        siteName={state.externalLink.siteName}
      />
    </>
  );
}

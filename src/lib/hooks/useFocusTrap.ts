import { useEffect, useRef, useCallback } from "react";

interface FocusTrapOptions {
  onEscape?: () => void;
}

export function useFocusTrap(isActive: boolean, options?: FocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onEscapeRef = useRef(options?.onEscape);
  onEscapeRef.current = options?.onEscape;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    function handleKeyDown(e: KeyboardEvent) {
      if (!container.contains(document.activeElement) && e.key !== "Escape") return;

      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    const focusable = container.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
}

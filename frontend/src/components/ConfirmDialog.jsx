import { useState, useEffect, useCallback } from "react";

let resolveRef = null;

export function confirmDialog({ title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
  return new Promise((resolve) => {
    resolveRef = resolve;
    window.dispatchEvent(new CustomEvent("open-confirm-dialog", {
      detail: { title, message, confirmText, cancelText, type }
    }));
  });
}

export default function ConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({ title: "", message: "", confirmText: "Confirm", cancelText: "Cancel", type: "danger" });

  useEffect(() => {
    const handleOpen = (e) => {
      setConfig(e.detail);
      setIsOpen(true);
    };
    window.addEventListener("open-confirm-dialog", handleOpen);
    return () => window.removeEventListener("open-confirm-dialog", handleOpen);
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) resolveRef(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) resolveRef(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative bg-base-200 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
          <p className="text-base-content/70">{config.message}</p>
        </div>
        <div className="flex gap-3 p-4 bg-base-100 border-t border-base-300">
          <button onClick={handleCancel} className="btn btn-ghost flex-1">
            {config.cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn flex-1 ${config.type === "danger" ? "btn-error" : "btn-primary"}`}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

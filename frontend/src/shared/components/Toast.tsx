import React, { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export const Toast: React.FC = () => {
  const { message, type, visible, hideNotification } = useNotificationStore();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      hideNotification();
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible, message, hideNotification]);

  if (!visible || !message) return null;

  const isError = type === "error";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-fade-in bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
          isError ? "bg-rose-500" : "bg-emerald-500"
        }`}
      />
      <span>{message}</span>
      <button
        type="button"
        onClick={hideNotification}
        className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};
import React, { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <div className={`${colors[type]} text-white px-6 py-3 shadow-lg flex items-center gap-3`}>
        <span className="text-sm tracking-wide">{message}</span>
        <button onClick={onClose}>✕</button>
      </div>
    </div>
  );
};

export default Toast;
import React from "react";

const CustomAlert = ({ message, type = "success", onClose }) => {
  if (!message) return null;

  const colors = {
    success: "border-green-500 text-green-600",
    error: "border-red-500 text-red-600",
    warning: "border-yellow-500 text-yellow-600",
  };

  return (
    <div className="fixed top-6 right-6 z-[100] animate-fadeIn">
      <div
        className={`bg-white shadow-lg border-l-4 px-6 py-4 min-w-[280px] ${colors[type]} flex items-center justify-between`}
      >
        <p className="text-sm tracking-wide">{message}</p>

        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;
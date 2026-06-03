import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // wait for animation to finish
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className={`
          ${colors[type]} text-white px-6 py-3 shadow-lg flex items-center gap-3 rounded-md
          transform transition-all duration-300 ease-out
          ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}
        `}
      >
        <span className="text-sm tracking-wide">{message}</span>
        <button onClick={() => setShow(false)}>✕</button>
      </div>
    </div>
  );
};

export default Toast;
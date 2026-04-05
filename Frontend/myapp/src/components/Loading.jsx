import React from "react";
import "./Loading.css";

const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loader"></div>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Loading;
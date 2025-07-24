import React from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({ message, onYes, onNo }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="btn yes" onClick={onYes}>Yes</button>
          <button className="btn no"  onClick={onNo}>No</button>
        </div>
      </div>
    </div>
  );
}

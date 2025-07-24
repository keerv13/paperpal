import React, { useState } from "react";
import PropTypes from "prop-types";


export default function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        className="chat-input__field"
        placeholder="Ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        className="chat-input__send-btn"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired
};

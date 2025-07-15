import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import "./Dashboard.css";

function Dashboard() {
  const [chats, setChats] = useState([]);
  const [activeChatIndex, setActiveChatIndex] = useState(null);

  const startNewChat = (file) => {
    const newChat = {
      documentName: file.name,
      messages: [],
    };
    setChats([...chats, newChat]);
    setActiveChatIndex(chats.length);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) startNewChat(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      startNewChat(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSendMessage = (msg) => {
    const updatedChats = chats.map((chat, index) => ({
  ...chat,
  active: index === activeChatIndex
}))};


  const activeChat = chats[activeChatIndex];

  return (
    <div className="dashboard">
      <Sidebar
        chats={chats}
        onNewChatClick={() => setActiveChatIndex(null)}
        setActiveChatIndex={setActiveChatIndex}
      />

      <div className="main">
        <Header />

        {!activeChat ? (
          <div className="upload-section">
            <p className="upload-title">
              Upload a document to <span>summarize?</span>
            </p>
            <label className="upload-btn" htmlFor="file-upload">
              Upload Document
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <p>or</p>
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img src="/upload-icon.svg" alt="Upload" />
              <p>Drag and drop here</p>
            </div>
          </div>
        ) : (
          <div className="chatbox">
            <textarea
              className="doc-display"
              readOnly
              value={`📄 ${activeChat.documentName}`}
            />
            <div className="chat-messages">
              {activeChat.messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="chat-input-wrapper">
              <ChatInput onSend={handleSendMessage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const send = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        placeholder="Ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default Dashboard;
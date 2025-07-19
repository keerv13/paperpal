  import React, { useState } from "react";
  import Header from "../components/Header";
  import Sidebar from "../components/SideBar";
  import "./Dashboard.css";

  function Dashboard() {
    const userId = localStorage.getItem('userId');
    const [chats, setChats] = useState([]);
    const [activeChatIndex, setActiveChatIndex] = useState(null);

    const handleSetActiveChatIndex = (index) => {
    const updatedChats = chats.map((chat, i) => ({
      ...chat,
      active: i === index,
    }));
    setChats(updatedChats);
    setActiveChatIndex(index);
  };


    const startNewChat = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append('userId', userId);

      try {
        const res = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        // Check if upload failed
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        const data = await res.json();
        console.log("Upload success:", data);

        // ✅ Only proceed if upload was successful
        const { documentId, chatId } = data;
        const newChat = {
          documentName: file.name,
          documentId,
          chatId,
          messages: [],
          active: true
        };

        const updatedChats = chats.map(chat => ({ ...chat, active: false }));
        setChats([...updatedChats, newChat]);
        setActiveChatIndex(updatedChats.length);

      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Upload failed. Please check the backend.");
        console.error("Error uploading file:", error);
  // show the backend’s error message if there is one
        alert(error.message || "Upload failed");
    }
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

    const handleSendMessage = async (text) => {
      // 1) Append the user message
      const userMsg = { role: "user", text };
      setChats(prev =>
        prev.map((chat, i) =>
          i === activeChatIndex
            ? { ...chat, messages: [...chat.messages, userMsg] }
            : chat
        )
      );

      // 2) Send to your backend
      try {
        const res = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, chatId: activeChat.chatId, query: text })
        });
        if (!res.ok) throw new Error("Query failed");
        const { answer } = await res.json();

        // 3) Append the assistant message
        setChats(prev =>
          prev.map((chat, i) =>
            i === activeChatIndex
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    { role: "assistant", text: answer }
                  ]
                }
              : chat
          )
        );
      } catch (err) {
        console.error(err);
        const errorMsg = {
          role: "assistant",
          text: "😕 Sorry, something went wrong."
        };
        setChats(prev =>
          prev.map((chat, i) =>
            i === activeChatIndex
              ? { ...chat, messages: [...chat.messages, errorMsg] }
              : chat
          )
        );
      }
    };




    const activeChat = chats[activeChatIndex];

    return (
      <div className="dashboard">
        <Sidebar
          chats={chats}
          onNewChatClick={() => {
            setActiveChatIndex(null);
            setChats(chats.map((c) => ({ ...c, active: false })));
          }}
          setActiveChatIndex={handleSetActiveChatIndex}
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
      if (!input.trim()) return;
      onSend(input.trim());
      setInput("");
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
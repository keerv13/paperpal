import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import ChatInput from "../components/ChatInput";
import ConfirmModal from "../components/ConfirmModal";
import "./Dashboard.css";

export default function Dashboard() {
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [activeChatIndex, setActiveChatIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState({ documentId: null, chatIndex: null });

  // fetch and auto‑activate on userId
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/chats?userId=${userId}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const formatted = data.map(chat => ({
          documentName: chat.documentName,
          documentId: chat.documentId,
          chatId: chat.chatId,
          messages: chat.messages.map(msg => ({
            role: msg.role,
            text: msg.text,
            timestamp: new Date(
              typeof msg.timestamp === "object" && msg.timestamp.$date
                ? msg.timestamp.$date
                : msg.timestamp
            )
          }))
        }));
        setChats(formatted);
        if (formatted.length > 0) {
          setChats(prev =>
            prev.map((chat, i) => ({ ...chat, active: i === 0 }))
          );
          setActiveChatIndex(0);
        }
      } catch (err) {
        console.error("Error loading chats:", err);
      }
    })();
  }, [userId]);

  // Activate first chat by default (after uploads settle)
  useEffect(() => {
    if (!isUploading && chats.length > 0 && activeChatIndex === null) {
      setActiveChatIndex(0);
      setChats(prev => prev.map((chat, i) => ({ ...chat, active: i === 0 })));
    }
  }, [chats, activeChatIndex, isUploading]);

  // Switch active chat
  const handleSetActiveChatIndex = index => {
    setChats(prev => prev.map((chat, i) => ({ ...chat, active: i === index })));
    setActiveChatIndex(index);
  };

  // Upload a new document + start a chat
  const startNewChat = async file => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const { documentId, chatId } = await res.json();
      const newChat = {
        documentName: file.name,
        documentId,
        chatId,
        messages: [],
        active: true
      };
      setChats(prev =>
        prev.map(c => ({ ...c, active: false })).concat(newChat)
      );
      setActiveChatIndex(chats.length);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = e => {
    if (e.target.files.length > 0) {
      startNewChat(e.target.files[0]);
      e.target.value = null; // reset so same file can be re‑selected
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      startNewChat(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = e => e.preventDefault();

  // Send a chat message
  const handleSendMessage = async text => {
    // Append user message locally
    setChats(prev =>
      prev.map((chat, i) =>
        i === activeChatIndex
          ? { ...chat, messages: [...chat.messages, { role: "user", text }] }
          : chat
      )
    );
    try {
      const response = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          chatId: chats[activeChatIndex].chatId,
          documentId: chats[activeChatIndex].documentId,
          query: text
        })
      });
      if (!response.ok) throw new Error("Query failed");
      const { answer } = await response.json();
      setChats(prev =>
        prev.map((chat, i) =>
          i === activeChatIndex
            ? {
                ...chat,
                messages: [...chat.messages, { role: "assistant", text: answer }]
              }
            : chat
        )
      );
    } catch (err) {
      console.error("Error querying:", err);
      setChats(prev =>
        prev.map((chat, i) =>
          i === activeChatIndex
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "assistant", text: "😕 Sorry, something went wrong." }
                ]
              }
            : chat
        )
      );
    }
  };

  // Delete flow
  const handleDeleteClick = (documentId, chatIndex) => {
    setToDelete({ documentId, chatIndex });
    setShowConfirm(true);
  };
  const confirmDelete = async () => {
    const { documentId, chatIndex } = toDelete;
    setShowConfirm(false);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${documentId}?userId=${userId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      setChats(prev => {
        const next = prev.filter((_, i) => i !== chatIndex);
        if (activeChatIndex === chatIndex) {
          setActiveChatIndex(next.length ? 0 : null);
          return next.map((c, i) => ({ ...c, active: i === 0 }));
        }
        return next;
      });
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Couldn’t delete document.");
    }
  };
  const cancelDelete = () => {
    setShowConfirm(false);
    setToDelete({ documentId: null, chatIndex: null });
  };

  const activeChat = chats[activeChatIndex];

  return (
    <div className="dashboard">
      <Sidebar
        chats={chats}
        onNewChatClick={() => {
          setActiveChatIndex(null);
          setChats(prev => prev.map(c => ({ ...c, active: false })));
          setIsUploading(true);
        }}
        setActiveChatIndex={handleSetActiveChatIndex}
        onDeleteDocument={handleDeleteClick}
      />

      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this document and its chat?"
          onYes={confirmDelete}
          onNo={cancelDelete}
        />
      )}

      <div className="main">
        <Header />

        {(isUploading || !activeChat) ? (
          <div
            className="upload-section"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Hidden file input */}
            <input
              id="fileInput"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Drag & drop prompt */}
            <p>📁 Drag &amp; drop a file here, or</p>
            <label htmlFor="fileInput" className="upload-select-btn">
              Select a File
            </label>
          </div>
        ) : (
          <div className="chatbox">
            <div className="chat-messages">
              {/* document title as an assistant bubble */}
              <div className="msg user">
                📄 {activeChat.documentName}
              </div>

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
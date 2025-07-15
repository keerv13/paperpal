function Sidebar({ chats, onNewChatClick, setActiveChatIndex }) {
  return (
    <div className="sidebar">
      <input type="text" placeholder="Search previous chats..." />
      <ul className="chat-list">
        {chats.map((chat, i) => (
          <li
            key={i}
            onClick={() => setActiveChatIndex(i)}
            className={chat.active ? "active" : ""}
          >
            {chat.documentName}
          </li>
        ))}
      </ul>
      <button className="new-chat-btn" onClick={onNewChatClick}>
        + New Document
      </button>

      <div className="sidebar-footer">
        <h3>Research Hive</h3>
      </div>
    </div>
  );
}

export default Sidebar;

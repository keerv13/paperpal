import closeIcon from '../assets/close.png';
import logo from '../assets/logo.svg';   


function Sidebar({ chats, onNewChatClick, setActiveChatIndex, onDeleteDocument }) {
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
            <span className="chat-name">{chat.documentName}</span>

            <button
              className="delete-btn"
              onClick={e => {
                e.stopPropagation();
                onDeleteDocument(chat.documentId, i);
              }}
            >
              <img src={closeIcon} alt="Delete" className="delete-icon" />
            </button>
          </li>
        ))}
      </ul>

      <button className="new-chat-btn" onClick={onNewChatClick}>
        + New Document
      </button>

      <div className="sidebar-footer">
        <img src={logo} alt="PaperPal Logo" className="sidebar-logo" />
        <h3>PaperPal</h3>
      </div>
    </div>
  );
}

export default Sidebar;

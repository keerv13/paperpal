import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Header />
        <div className="upload-section">
          <p className="upload-title">Upload a document to <span>summarize?</span></p>
          <button className="upload-btn">Upload Document</button>
          <p>or</p>
          <div className="drop-zone">
            <img src="/upload-icon.svg" alt="Upload" />
            <p>Drag and drop here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

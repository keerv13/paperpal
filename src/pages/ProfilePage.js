import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    try {

      localStorage.removeItem('authToken');

      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      <div className="profile-actions">
        <button
          className="btn btn-logout"
          onClick={() => setShowLogoutModal(true)}
        >
          Logout
        </button>
      </div>

      <button
        className="back-btn"
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </button>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={confirmLogout}
              >
                Yes
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

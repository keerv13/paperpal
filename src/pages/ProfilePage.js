import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';


function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      // If you have a server‑side logout endpoint, call it:
      // await axios.post('/auth/logout');

      // Client‑side cleanup (token, user info, etc.)
      localStorage.removeItem('authToken');
      // ...any other cleanup...

      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Optionally show a message to the user
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      <div className="profile-actions">
        <button
          className="btn btn-primary"
          onClick={() => {}}
        >
          My Profile
        </button>
        <button
          className="btn btn-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <button
        className="back-btn"
        onClick={() => navigate('/dashboard')}
      >
        Back to HomePage
      </button>
    </div>
  );
}


export default ProfilePage;

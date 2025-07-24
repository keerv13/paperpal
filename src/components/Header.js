import React from 'react';
import { Link } from 'react-router-dom';
import profile from '../assets/user.png';

function Header() {
  return (
    <div className="header" style={{ display: 'flex', alignItems: 'center' }}>
      {/* spacer to push profile icon to the right */}
      <div style={{ flex: 1 }} />

      {/* only display the user profile icon */}
      <Link to="/profile">
        <img
          src={profile}
          alt="Profile"
          className="h-8 w-8 rounded-full cursor-pointer"
        />
      </Link>
    </div>
  );
}
export default Header;



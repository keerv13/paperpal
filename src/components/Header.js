import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';
import profile from '../assets/user.png';

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="Logo" />
      <h2>Research <span style={{ color: "blueviolet" }}>Hive</span></h2>
      <Link to="/profile">
        <img src={profile} alt="Profile" className="h-8 w-8 rounded-full cursor-pointer" />
      </Link>
    </div>
  );
}

export default Header;


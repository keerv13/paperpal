import logo from '../assets/logo.svg';

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="Logo" />
      <h2>Research <span style={{ color: "blueviolet" }}>Hive</span></h2>
      <div className="profile-icon">👤</div>
    </div>
  );
}

export default Header;


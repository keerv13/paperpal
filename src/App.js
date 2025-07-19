import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                      element={<Auth />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword  />} />
        <Route path="/dashboard"             element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* optionally add a catch‑all 404 route here */}
      </Routes>
    </Router>
  )
}

export default App;

// import bg from './bg.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <div className="SplitPane">
//       <div
//           className="Pane left"
//           style={{ '--bg-image': `url(${bg})` }}
//         ></div>
//         <div className="Pane right">
//           {/* Content goes here */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
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


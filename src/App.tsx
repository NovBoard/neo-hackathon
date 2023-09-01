// import './styles/App.css';
import { BrowserRouter as Router, Route, Routes  } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Pool } from "./pages/Pool";
import { History } from "./pages/History";
import { Wallet } from "./pages/Wallet";
import { Login } from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pool" element={<Pool/>} />
        <Route path="/history" element={<History/>} />
        <Route path="/wallet" element={<Wallet/>} />
      </Routes>
    </Router>
  );
}

export default App;
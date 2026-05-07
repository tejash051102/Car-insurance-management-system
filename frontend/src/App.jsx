import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Claims from "./pages/Claims.jsx";
import Customers from "./pages/Customers.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Payments from "./pages/Payments.jsx";
import Policies from "./pages/Policies.jsx";
import Register from "./pages/Register.jsx";
import Vehicles from "./pages/Vehicles.jsx";

const getStoredUser = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

const AppLayout = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="lg:pl-64">
          <Navbar user={user} onLogout={onLogout} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="px-4 py-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleAuth = (userInfo) => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onAuth={handleAuth} />} />
      <Route path="/register" element={<Register onAuth={handleAuth} />} />
      <Route path="/*" element={<AppLayout user={user} onLogout={handleLogout} />} />
    </Routes>
  );
};

export default App;

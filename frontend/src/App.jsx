import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SiteDetail from './pages/SiteDetail.jsx';
import AgentPage from './pages/AgentPage.jsx';
import Demo from './pages/Demo.jsx';

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ink bg-grid">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/sites/:id" element={<Protected><SiteDetail /></Protected>} />
        <Route path="/sites/:id/agent" element={<Protected><AgentPage /></Protected>} />
        <Route path="/demo" element={<Protected><Demo /></Protected>} />
        <Route path="/demo/:id" element={<Protected><Demo /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

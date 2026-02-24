import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Code2, Brain, TrendingUp, Trophy, Settings,
  LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/questions', icon: <Code2 size={18} />, label: 'Questions' },
  { to: '/ai-tools', icon: <Brain size={18} />, label: 'AI Tools' },
  { to: '/progress', icon: <TrendingUp size={18} />, label: 'Progress' },
  { to: '/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">H</div>
        <span className="sidebar-title">HireReady</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="sidebar-section-label">Admin</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Shield size={18} />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button className="sidebar-item btn-ghost" onClick={handleLogout} style={{ width: '100%', border: 'none' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

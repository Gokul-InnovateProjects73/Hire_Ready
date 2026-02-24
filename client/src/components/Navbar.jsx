import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title = 'HireReady' }) {
  const { user } = useAuth();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span>{title}</span>
      </div>
      <div className="navbar-right">
        <button className="btn btn-ghost" style={{ padding: '6px' }}>
          <Bell size={18} />
        </button>
        <div className="navbar-user">
          <div className="user-avatar">{initials}</div>
          <span>{user?.username || 'User'}</span>
        </div>
      </div>
    </header>
  );
}

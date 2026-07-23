import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, User as UserIcon, Bell } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="btn-icon mobile-menu-btn" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
        <h2 className="navbar-title">Enterprise Resource Planning</h2>
      </div>

      <div className="navbar-right">
        <button className="btn-icon bell-btn" title="Notifications">
          <Bell size={20} />
          <span className="bell-badge" />
        </button>

        <div className="navbar-profile">
          <UserIcon size={18} className="profile-icon" />
          <span className="profile-email">{user?.email}</span>
        </div>
      </div>
    </header>
  );
};

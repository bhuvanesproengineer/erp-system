import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../../context/AuthContext';
import { Menu, User as UserIcon, Bell } from 'lucide-react';
export const Navbar = ({ onToggleSidebar }) => {
    const { user } = useAuth();
    return (_jsxs("header", { className: "navbar", children: [_jsxs("div", { className: "navbar-left", children: [_jsx("button", { className: "btn-icon mobile-menu-btn", onClick: onToggleSidebar, children: _jsx(Menu, { size: 22 }) }), _jsx("h2", { className: "navbar-title", children: "Enterprise Resource Planning" })] }), _jsxs("div", { className: "navbar-right", children: [_jsxs("button", { className: "btn-icon bell-btn", title: "Notifications", children: [_jsx(Bell, { size: 20 }), _jsx("span", { className: "bell-badge" })] }), _jsxs("div", { className: "navbar-profile", children: [_jsx(UserIcon, { size: 18, className: "profile-icon" }), _jsx("span", { className: "profile-email", children: user?.email })] })] })] }));
};

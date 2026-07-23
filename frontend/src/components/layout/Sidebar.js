import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Package, Boxes, FileText, LogOut, Building2, X, } from 'lucide-react';
export const Sidebar = ({ isOpen, onCloseMobile }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const navItems = [
        { label: 'Dashboard', path: '/', icon: _jsx(LayoutDashboard, { size: 20 }) },
        { label: 'Customers', path: '/customers', icon: _jsx(Users, { size: 20 }) },
        { label: 'Products', path: '/products', icon: _jsx(Package, { size: 20 }) },
        { label: 'Inventory', path: '/inventory', icon: _jsx(Boxes, { size: 20 }) },
        { label: 'Sales Challans', path: '/challans', icon: _jsx(FileText, { size: 20 }) },
    ];
    return (_jsxs(_Fragment, { children: [isOpen && _jsx("div", { className: "sidebar-backdrop", onClick: onCloseMobile }), _jsxs("aside", { className: `sidebar ${isOpen ? 'sidebar-open' : ''}`, children: [_jsxs("div", { className: "sidebar-header", children: [_jsxs("div", { className: "brand-logo", children: [_jsx(Building2, { size: 28, className: "brand-icon" }), _jsx("span", { className: "brand-name", children: "MiniERP" })] }), _jsx("button", { className: "mobile-close-btn", onClick: onCloseMobile, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "sidebar-user", children: [_jsx("div", { className: "user-avatar", children: user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase() }), _jsxs("div", { className: "user-info", children: [_jsx("span", { className: "user-name", children: user?.name || user?.username || 'User' }), _jsx("span", { className: "user-role", children: user?.role || 'Staff' })] })] }), _jsx("nav", { className: "sidebar-nav", children: navItems.map((item) => (_jsxs(NavLink, { to: item.path, className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`, onClick: onCloseMobile, end: item.path === '/', children: [_jsx("span", { className: "nav-icon", children: item.icon }), _jsx("span", { className: "nav-label", children: item.label })] }, item.path))) }), _jsx("div", { className: "sidebar-footer", children: _jsxs("button", { className: "btn-logout", onClick: handleLogout, children: [_jsx(LogOut, { size: 20 }), _jsx("span", { children: "Logout" })] }) })] })] }));
};

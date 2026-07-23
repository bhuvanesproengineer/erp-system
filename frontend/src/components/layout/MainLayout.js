import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "app-layout", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onCloseMobile: () => setSidebarOpen(false) }), _jsxs("div", { className: "main-content-wrapper", children: [_jsx(Navbar, { onToggleSidebar: () => setSidebarOpen((prev) => !prev) }), _jsx("main", { className: "page-container", children: _jsx(Outlet, {}) })] })] }));
};

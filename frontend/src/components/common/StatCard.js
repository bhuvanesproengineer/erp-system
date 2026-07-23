import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const StatCard = ({ title, value, icon, color = 'primary', subtext, }) => {
    return (_jsxs("div", { className: `stat-card stat-card-${color}`, children: [_jsx("div", { className: "stat-icon-wrapper", children: icon }), _jsxs("div", { className: "stat-content", children: [_jsx("span", { className: "stat-title", children: title }), _jsx("h3", { className: "stat-value", children: value }), subtext && _jsx("span", { className: "stat-subtext", children: subtext })] })] }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Inbox } from 'lucide-react';
export const EmptyState = ({ title = 'No records found', description = 'There are no data records available at the moment.', action, }) => {
    return (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: _jsx(Inbox, { size: 48 }) }), _jsx("h3", { className: "empty-title", children: title }), _jsx("p", { className: "empty-description", children: description }), action && _jsx("div", { className: "empty-action", children: action })] }));
};

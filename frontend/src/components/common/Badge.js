import { jsx as _jsx } from "react/jsx-runtime";
export const Badge = ({ variant = 'info', children }) => {
    return _jsx("span", { className: `badge badge-${variant}`, children: children });
};

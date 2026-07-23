import { jsx as _jsx } from "react/jsx-runtime";
export const Spinner = ({ size = 'md', fullScreen = false }) => {
    const content = _jsx("div", { className: `spinner spinner-${size}` });
    if (fullScreen) {
        return _jsx("div", { className: "spinner-fullscreen", children: content });
    }
    return content;
};

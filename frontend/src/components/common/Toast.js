import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();
    if (toasts.length === 0)
        return null;
    return (_jsx("div", { className: "toast-container", children: toasts.map((toast) => (_jsxs("div", { className: `toast toast-${toast.type}`, children: [_jsxs("div", { className: "toast-icon", children: [toast.type === 'success' && _jsx(CheckCircle2, { size: 18 }), toast.type === 'error' && _jsx(AlertCircle, { size: 18 }), toast.type === 'info' && _jsx(Info, { size: 18 }), toast.type === 'warning' && _jsx(AlertTriangle, { size: 18 })] }), _jsx("div", { className: "toast-message", children: toast.message }), _jsx("button", { className: "toast-close", onClick: () => removeToast(toast.id), children: _jsx(X, { size: 14 }) })] }, toast.id))) }));
};

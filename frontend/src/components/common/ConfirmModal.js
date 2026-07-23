import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', isLoading = false, }) => {
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: title, size: "sm", footer: _jsxs(_Fragment, { children: [_jsx("button", { className: "btn btn-secondary", onClick: onClose, disabled: isLoading, children: cancelText }), _jsx("button", { className: `btn btn-${variant}`, onClick: onConfirm, disabled: isLoading, children: isLoading ? 'Processing...' : confirmText })] }), children: _jsxs("div", { className: "confirm-modal-body", children: [_jsx("div", { className: `confirm-icon icon-${variant}`, children: _jsx(AlertTriangle, { size: 32 }) }), _jsx("p", { className: "confirm-message", children: message })] }) }));
};

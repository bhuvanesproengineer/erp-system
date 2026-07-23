import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
export const Pagination = ({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange, }) => {
    if (totalPages <= 1)
        return null;
    const handlePrev = () => {
        if (currentPage > 1)
            onPageChange(currentPage - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages)
            onPageChange(currentPage + 1);
    };
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;
    return (_jsxs("div", { className: "pagination", children: [_jsxs("div", { className: "pagination-info", children: ["Showing ", startItem, " to ", endItem, " ", totalItems ? `of ${totalItems} entries` : ''] }), _jsxs("div", { className: "pagination-controls", children: [_jsx("button", { className: "btn-icon", onClick: handlePrev, disabled: currentPage === 1, title: "Previous Page", children: _jsx(ChevronLeft, { size: 18 }) }), _jsxs("span", { className: "pagination-page-indicator", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { className: "btn-icon", onClick: handleNext, disabled: currentPage === totalPages, title: "Next Page", children: _jsx(ChevronRight, { size: 18 }) })] })] }));
};

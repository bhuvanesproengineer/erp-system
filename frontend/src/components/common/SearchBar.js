import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
export const SearchBar = ({ placeholder = 'Search...', value = '', onSearch, debounceMs = 300, }) => {
    const [term, setTerm] = useState(value);
    useEffect(() => {
        setTerm(value);
    }, [value]);
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(term);
        }, debounceMs);
        return () => clearTimeout(handler);
    }, [term, debounceMs, onSearch]);
    const handleClear = () => {
        setTerm('');
        onSearch('');
    };
    return (_jsxs("div", { className: "search-bar", children: [_jsx(Search, { size: 18, className: "search-icon" }), _jsx("input", { type: "text", className: "search-input", placeholder: placeholder, value: term, onChange: (e) => setTerm(e.target.value) }), term && (_jsx("button", { className: "search-clear", onClick: handleClear, type: "button", children: _jsx(X, { size: 14 }) }))] }));
};

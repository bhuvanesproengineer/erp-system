import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
export function Table({ columns, data, isLoading = false, emptyTitle, emptyDescription, keyExtractor, }) {
    if (isLoading) {
        return (_jsx("div", { className: "table-loading-container", children: _jsx(Spinner, { size: "lg" }) }));
    }
    if (!data || data.length === 0) {
        return _jsx(EmptyState, { title: emptyTitle, description: emptyDescription });
    }
    return (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((col, idx) => (_jsx("th", { style: { width: col.width }, children: col.header }, idx))) }) }), _jsx("tbody", { children: data.map((row) => (_jsx("tr", { children: columns.map((col, idx) => (_jsx("td", { children: col.render
                                ? col.render(row)
                                : col.accessor
                                    ? row[col.accessor]
                                    : null }, idx))) }, keyExtractor(row)))) })] }) }));
}

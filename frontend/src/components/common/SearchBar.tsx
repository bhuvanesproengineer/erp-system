import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (keyword: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onSearch,
  debounceMs = 300,
}) => {
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

  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {term && (
        <button className="search-clear" onClick={handleClear} type="button">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

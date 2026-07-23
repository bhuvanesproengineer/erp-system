import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {startItem} to {endItem} {totalItems ? `of ${totalItems} entries` : ''}
      </div>
      <div className="pagination-controls">
        <button
          className="btn-icon"
          onClick={handlePrev}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="pagination-page-indicator">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn-icon"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="empty-state py-12">
      <div className="empty-icon text-danger">
        <AlertCircle size={64} />
      </div>
      <h1 className="empty-title">404 - Page Not Found</h1>
      <p className="empty-description">The requested route does not exist in the ERP system.</p>
      <Link to="/" className="btn btn-primary mt-4">
        Return to Dashboard
      </Link>
    </div>
  );
};

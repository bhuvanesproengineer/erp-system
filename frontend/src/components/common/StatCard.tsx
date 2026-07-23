import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtext,
}) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <h3 className="stat-value">{value}</h3>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
    </div>
  );
};

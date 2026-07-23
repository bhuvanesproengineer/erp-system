import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', fullScreen = false }) => {
  const content = <div className={`spinner spinner-${size}`} />;

  if (fullScreen) {
    return <div className="spinner-fullscreen">{content}</div>;
  }

  return content;
};

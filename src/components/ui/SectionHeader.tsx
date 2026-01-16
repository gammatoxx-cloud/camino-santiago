import React from 'react';

interface SectionHeaderProps {
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ label, icon, className = '' }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`}>
      <div className="section-header-label">
        {icon && <span className="text-teal">{icon}</span>}
        <span>{label}</span>
      </div>
    </div>
  );
}



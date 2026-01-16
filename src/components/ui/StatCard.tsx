import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  number: string | number;
  label: string;
  className?: string;
}

export function StatCard({ number, label, className = '' }: StatCardProps) {
  return (
    <Card className={`stat-card ${className}`}>
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </Card>
  );
}



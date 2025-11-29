import React from 'react';
import { AttachmentStatus } from '../types';

interface StatusBadgeProps {
  status: AttachmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = (s: AttachmentStatus) => {
    switch (s) {
      case AttachmentStatus.EFFECTIVE:
        return 'bg-green-50 text-green-700 border-green-200 ring-green-600/20';
      case AttachmentStatus.EXPIRED:
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${getStyles(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === AttachmentStatus.EFFECTIVE ? 'bg-green-500' : 'bg-slate-500'
      }`}></span>
      {status}
    </span>
  );
};
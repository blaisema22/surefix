// StatusBadge Component
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;

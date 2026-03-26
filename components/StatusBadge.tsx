import React from 'react';

interface StatusBadgeProps {
  status: string;
  icon?: string;
  className?: string;
}

export function StatusBadge({ status, icon, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      Pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: '⏳'
      },
      Processing: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        icon: '⚙️'
      },
      Shipped: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: '🚚'
      },
      Delivered: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: '✅'
      },
      Cancelled: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: '❌'
      },
      Active: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        icon: '🟢'
      },
      Inactive: {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        icon: '🔴'
      }
    };

    return configs[status as keyof typeof configs] || {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      icon: '❓'
    };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <span>{icon || config.icon}</span>
      {status}
    </span>
  );
}
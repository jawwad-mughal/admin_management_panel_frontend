import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {action.icon}
          {action.label}
        </Link>
      )}
    </div>
  );
}
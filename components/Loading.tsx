import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {message && <span className="text-gray-600 dark:text-gray-400">{message}</span>}
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
  className?: string;
}

export function LoadingCard({ message = "Loading...", className = '' }: LoadingCardProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <LoadingSpinner message={message} />
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}
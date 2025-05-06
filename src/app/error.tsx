'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="card max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Something went wrong</h2>
        <p className="mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm overflow-auto max-h-32">
          {error.message || 'Unknown error'}
        </div>
        <button
          onClick={() => reset()}
          className="btn btn-primary w-full"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

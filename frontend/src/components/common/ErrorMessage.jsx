// components/common/ErrorMessage.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center py-12">
      <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
      <p className="text-red-600 text-lg mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
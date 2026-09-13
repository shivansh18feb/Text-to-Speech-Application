import React from 'react';
import { PlayCircle, Loader2 } from 'lucide-react';

export default function GenerateButton({
  onClick,
  isLoading = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-sky-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center space-x-2 text-base"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating Speech...</span>
        </>
      ) : (
        <>
          <PlayCircle className="w-5 h-5" />
          <span>Generate Speech</span>
        </>
      )}
    </button>
  );
}

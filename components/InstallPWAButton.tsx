import React from 'react';

interface InstallPWAButtonProps {
  onInstallClick: () => void;
}

const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({ onInstallClick }) => {
  return (
    <button
      onClick={onInstallClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-4 rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 animate-pulse-install"
      aria-label="Instalar aplicación"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-0 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
};

export default InstallPWAButton;

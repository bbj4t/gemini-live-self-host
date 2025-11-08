import React from 'react';
import { AppState } from '../types';

interface ControlButtonProps {
  appState: AppState;
  onClick: () => void;
}

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6z" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const ControlButton: React.FC<ControlButtonProps> = ({ appState, onClick }) => {
    const isBusy = appState === 'connecting' || appState === 'processing';
    const isListening = appState === 'listening';

    const getButtonClass = () => {
        if (isListening) return 'bg-red-500 hover:bg-red-600';
        if (isBusy) return 'bg-gray-600 cursor-not-allowed';
        return 'bg-blue-600 hover:bg-blue-700';
    };

    return (
        <button
            onClick={onClick}
            disabled={isBusy}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${getButtonClass()} ${isListening ? 'focus:ring-red-400' : 'focus:ring-blue-400'}`}
        >
            {isBusy && <SpinnerIcon />}
            {isListening && <StopIcon />}
            {appState === 'idle' && <MicrophoneIcon />}
            {appState === 'error' && <MicrophoneIcon />}
        </button>
    );
};

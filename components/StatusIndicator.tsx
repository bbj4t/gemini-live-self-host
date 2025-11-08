import React from 'react';
import { AppState } from '../types';

interface StatusIndicatorProps {
  appState: AppState;
  error: string | null;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ appState, error }) => {
  const getStatusInfo = () => {
    switch (appState) {
      case 'idle':
        return { text: 'Press the button to start talking', color: 'bg-gray-500' };
      case 'connecting':
        return { text: 'Connecting...', color: 'bg-yellow-500 animate-pulse' };
      case 'listening':
        return { text: 'Listening... Speak now.', color: 'bg-green-500 animate-pulse' };
      case 'processing':
        return { text: 'Thinking...', color: 'bg-yellow-500 animate-pulse' };
      case 'error':
        return { text: `Error: ${error || 'An unknown error occurred.'}`, color: 'bg-red-500' };
      default:
        return { text: '', color: 'bg-gray-500' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <div className="flex items-center justify-center space-x-3 h-10">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <p className="text-lg text-gray-300">{text}</p>
    </div>
  );
};

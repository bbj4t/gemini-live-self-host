import React, { useState, useEffect } from 'react';
import { ServiceMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  llmEndpoint: string;
  setLlmEndpoint: (url: string) => void;
  ttsEndpoint: string;
  setTtsEndpoint: (url: string) => void;
  llmApiCred: string;
  setLlmApiCred: (cred: string) => void;
  ttsApiCred: string;
  setTtsApiCred: (cred: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  serviceMode,
  setServiceMode,
  llmEndpoint,
  setLlmEndpoint,
  ttsEndpoint,
  setTtsEndpoint,
  llmApiCred,
  setLlmApiCred,
  ttsApiCred,
  setTtsApiCred,
}) => {
  const [localServiceMode, setLocalServiceMode] = useState(serviceMode);
  const [localLlmEndpoint, setLocalLlmEndpoint] = useState(llmEndpoint);
  const [localTtsEndpoint, setLocalTtsEndpoint] = useState(ttsEndpoint);
  const [localLlmApiCred, setLocalLlmApiCred] = useState(llmApiCred);
  const [localTtsApiCred, setLocalTtsApiCred] = useState(ttsApiCred);

  useEffect(() => {
    if (isOpen) {
        setLocalServiceMode(serviceMode);
        setLocalLlmEndpoint(llmEndpoint);
        setLocalTtsEndpoint(ttsEndpoint);
        setLocalLlmApiCred(llmApiCred);
        setLocalTtsApiCred(ttsApiCred);
    }
  }, [isOpen, serviceMode, llmEndpoint, ttsEndpoint, llmApiCred, ttsApiCred]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    setServiceMode(localServiceMode);
    setLlmEndpoint(localLlmEndpoint);
    setTtsEndpoint(localTtsEndpoint);
    setLlmApiCred(localLlmApiCred);
    setTtsApiCred(localTtsApiCred);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
        
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2">Service Mode</label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setLocalServiceMode('gemini')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors ${
                localServiceMode === 'gemini' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Gemini
            </button>
            <button
              type="button"
              onClick={() => setLocalServiceMode('self-hosted')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors ${
                localServiceMode === 'self-hosted' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Self-Hosted
            </button>
          </div>
        </div>

        {localServiceMode === 'self-hosted' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="llm-endpoint" className="block text-gray-400 text-sm font-bold mb-2">
                LLM API Endpoint
              </label>
              <input
                id="llm-endpoint"
                type="url"
                value={localLlmEndpoint}
                onChange={(e) => setLocalLlmEndpoint(e.target.value)}
                placeholder="https://example.com/api/llm"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="llm-api-cred" className="block text-gray-400 text-sm font-bold mb-2">
                LLM API Credential (Optional)
              </label>
              <input
                id="llm-api-cred"
                type="password"
                value={localLlmApiCred}
                onChange={(e) => setLocalLlmApiCred(e.target.value)}
                placeholder="Authentication Token"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="tts-endpoint" className="block text-gray-400 text-sm font-bold mb-2">
                TTS API Endpoint
              </label>
              <input
                id="tts-endpoint"
                type="url"
                value={localTtsEndpoint}
                onChange={(e) => setLocalTtsEndpoint(e.target.value)}
                placeholder="https://example.com/api/tts"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="tts-api-cred" className="block text-gray-400 text-sm font-bold mb-2">
                TTS API Credential (Optional)
              </label>
              <input
                id="tts-api-cred"
                type="password"
                value={localTtsApiCred}
                onChange={(e) => setLocalTtsApiCred(e.target.value)}
                placeholder="Authentication Token"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple fade-in animation for when the self-hosted options appear
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;
document.head.append(style);
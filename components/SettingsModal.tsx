import React, { useState, useEffect } from 'react';
import { ServiceMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  llmEndpoint: string;
  setLlmEndpoint: (url: string) => void;
  llmModel: string;
  setLlmModel: (model: string) => void;
  ttsEndpoint: string;
  setTtsEndpoint: (url: string) => void;
  llmApiCred: string;
  setLlmApiCred: (cred: string) => void;
  ttsApiCred: string;
  setTtsApiCred: (cred: string) => void;
  supabaseUrl: string;
  setSupabaseUrl: (url: string) => void;
  supabaseKey: string;
  setSupabaseKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  serviceMode,
  setServiceMode,
  llmEndpoint,
  setLlmEndpoint,
  llmModel,
  setLlmModel,
  ttsEndpoint,
  setTtsEndpoint,
  llmApiCred,
  setLlmApiCred,
  ttsApiCred,
  setTtsApiCred,
  supabaseUrl,
  setSupabaseUrl,
  supabaseKey,
  setSupabaseKey,
}) => {
  const [localServiceMode, setLocalServiceMode] = useState(serviceMode);
  const [localLlmEndpoint, setLocalLlmEndpoint] = useState(llmEndpoint);
  const [localLlmModel, setLocalLlmModel] = useState(llmModel);
  const [localTtsEndpoint, setLocalTtsEndpoint] = useState(ttsEndpoint);
  const [localLlmApiCred, setLocalLlmApiCred] = useState(llmApiCred);
  const [localTtsApiCred, setLocalTtsApiCred] = useState(ttsApiCred);
  const [localSupabaseUrl, setLocalSupabaseUrl] = useState(supabaseUrl);
  const [localSupabaseKey, setLocalSupabaseKey] = useState(supabaseKey);

  useEffect(() => {
    if (isOpen) {
        setLocalServiceMode(serviceMode);
        setLocalLlmEndpoint(llmEndpoint);
        setLocalLlmModel(llmModel);
        setLocalTtsEndpoint(ttsEndpoint);
        setLocalLlmApiCred(llmApiCred);
        setLocalTtsApiCred(ttsApiCred);
        setLocalSupabaseUrl(supabaseUrl);
        setLocalSupabaseKey(supabaseKey);
    }
  }, [isOpen, serviceMode, llmEndpoint, llmModel, ttsEndpoint, llmApiCred, ttsApiCred, supabaseUrl, supabaseKey]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    setServiceMode(localServiceMode);
    setLlmEndpoint(localLlmEndpoint);
    setLlmModel(localLlmModel);
    setTtsEndpoint(localTtsEndpoint);
    setLlmApiCred(localLlmApiCred);
    setTtsApiCred(localTtsApiCred);
    setSupabaseUrl(localSupabaseUrl);
    setSupabaseKey(localSupabaseKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md overflow-y-auto max-h-full">
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
          <div className="space-y-4 animate-fade-in mb-6">
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
              <label htmlFor="llm-model" className="block text-gray-400 text-sm font-bold mb-2">
                LLM Model (Optional)
              </label>
              <input
                id="llm-model"
                type="text"
                value={localLlmModel}
                onChange={(e) => setLocalLlmModel(e.target.value)}
                placeholder="e.g., openai/gpt-4o"
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

        <div className="pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-white">Supabase Backend</h3>
          <p className="text-sm text-gray-400 mb-4">
            Enable chat history for all modes and RAG for self-hosted mode. 
            You'll need a <code className="bg-gray-900 px-1 rounded-sm">chat_history</code> table and a <code className="bg-gray-900 px-1 rounded-sm">vector-search</code> edge function.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="supabase-url" className="block text-gray-400 text-sm font-bold mb-2">
                Supabase URL
              </label>
              <input
                id="supabase-url"
                type="url"
                value={localSupabaseUrl}
                onChange={(e) => setLocalSupabaseUrl(e.target.value)}
                placeholder="https://<project-ref>.supabase.co"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="supabase-key" className="block text-gray-400 text-sm font-bold mb-2">
                Supabase Anon Key
              </label>
              <input
                id="supabase-key"
                type="password"
                value={localSupabaseKey}
                onChange={(e) => setLocalSupabaseKey(e.target.value)}
                placeholder="Your Supabase anon key"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
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
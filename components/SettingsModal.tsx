import React, { useState, useEffect } from 'react';
import { ServiceMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  geminiVoice: string;
  setGeminiVoice: (voice: string) => void;
  llmModel: string;
  setLlmModel: (model: string) => void;
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
  geminiVoice,
  setGeminiVoice,
  llmModel,
  setLlmModel,
  supabaseUrl,
  setSupabaseUrl,
  supabaseKey,
  setSupabaseKey,
}) => {
  const [localServiceMode, setLocalServiceMode] = useState(serviceMode);
  const [localGeminiVoice, setLocalGeminiVoice] = useState(geminiVoice);
  const [localLlmModel, setLocalLlmModel] = useState(llmModel);
  const [localSupabaseUrl, setLocalSupabaseUrl] = useState(supabaseUrl);
  const [localSupabaseKey, setLocalSupabaseKey] = useState(supabaseKey);

  useEffect(() => {
    if (isOpen) {
        setLocalServiceMode(serviceMode);
        setLocalGeminiVoice(geminiVoice);
        setLocalLlmModel(llmModel);
        setLocalSupabaseUrl(supabaseUrl);
        setLocalSupabaseKey(supabaseKey);
    }
  }, [isOpen, serviceMode, geminiVoice, llmModel, supabaseUrl, supabaseKey]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    setServiceMode(localServiceMode);
    setGeminiVoice(localGeminiVoice);
    setLlmModel(localLlmModel);
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
        
        {localServiceMode === 'gemini' && (
            <div className="animate-fade-in mb-6">
                <label htmlFor="gemini-voice" className="block text-gray-400 text-sm font-bold mb-2">
                Gemini Voice
                </label>
                <select
                id="gemini-voice"
                value={localGeminiVoice}
                onChange={(e) => setLocalGeminiVoice(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Zephyr">Zephyr (Female)</option>
                    <option value="Puck">Puck (Male)</option>
                    <option value="Charon">Charon (Male, Deep)</option>
                    <option value="Kore">Kore (Female)</option>
                    <option value="Fenrir">Fenrir (Male)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Select a voice for Gemini's audio responses.</p>
            </div>
        )}

        {localServiceMode === 'self-hosted' && (
          <div className="space-y-4 animate-fade-in mb-6">
             <p className="text-sm text-gray-400">
                Self-hosted mode now uses a Supabase Edge Function as a secure proxy.
                Please configure your API endpoints and credentials as secrets in your Supabase project settings.
             </p>
             <div>
              <label htmlFor="llm-model" className="block text-gray-400 text-sm font-bold mb-2">
                LLM Model Name (Optional)
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
          </div>
        )}

        <div className="pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-white">Supabase Backend</h3>
          <p className="text-sm text-gray-400 mb-4">
            Required for all modes to enable chat history and RAG. Self-hosted mode also requires a <code className="bg-gray-900 px-1 rounded-sm">llm-proxy</code> edge function.
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
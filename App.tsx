import React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppState, TranscriptTurn, ServiceMode } from './types';
import { createBlob, decode, decodeAudioData } from './utils/audioUtils';
import { initSupabase, getChatHistory, saveChatTurn, performRagSearch } from './utils/supabase';
import { ControlButton } from './components/ControlButton';
import { StatusIndicator } from './components/StatusIndicator';
import { TranscriptView } from './components/TranscriptView';
import { SettingsModal } from './components/SettingsModal';
import { SettingsIcon } from './components/SettingsIcon';

// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
}

const App: React.FC = () => {
  // App State
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serviceMode, setServiceMode] = useState<ServiceMode>('gemini');
  const [geminiVoice, setGeminiVoice] = useState('Zephyr');
  const [llmModel, setLlmModel] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  
  // Supabase state
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Transcript State
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<{ user: string; model: string }>({ user: '', model: '' });

  // Refs for Gemini Live API
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Refs for Self-Hosted Mode
  const finalTranscriptRef = useRef<string>('');
  const wasStoppedManuallyRef = useRef<boolean>(false);

  // Refs for Audio playback (both modes)
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Effect to load settings from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('serviceMode') as ServiceMode;
    if (savedMode) setServiceMode(savedMode);
    setGeminiVoice(localStorage.getItem('geminiVoice') || 'Zephyr');
    setLlmModel(localStorage.getItem('llmModel') || '');
    setSupabaseUrl(localStorage.getItem('supabaseUrl') || '');
    setSupabaseKey(localStorage.getItem('supabaseKey') || '');
  }, []);

  // Effect to initialize Supabase and load history
  useEffect(() => {
    const client = initSupabase(supabaseUrl, supabaseKey);
    setSupabaseClient(client);

    let sid = sessionStorage.getItem('chatSessionId');
    if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem('chatSessionId', sid);
    }
    sessionIdRef.current = sid;

    const loadHistory = async () => {
        if (client && sessionIdRef.current) {
            try {
                const history = await getChatHistory(sessionIdRef.current);
                setTranscriptHistory(history);
            } catch (err: any) {
                setError(`Failed to load history: ${err.message}`);
                setAppState('error');
            }
        } else {
            setTranscriptHistory([]);
        }
    };
    loadHistory();
  }, [supabaseUrl, supabaseKey]);

  // Handlers to save settings to localStorage
  const handleSetServiceMode = (mode: ServiceMode) => { setServiceMode(mode); localStorage.setItem('serviceMode', mode); };
  const handleSetGeminiVoice = (voice: string) => { setGeminiVoice(voice); localStorage.setItem('geminiVoice', voice); };
  const handleSetLlmModel = (model: string) => { setLlmModel(model); localStorage.setItem('llmModel', model); };
  const handleSetSupabaseUrl = (url: string) => { setSupabaseUrl(url); localStorage.setItem('supabaseUrl', url); };
  const handleSetSupabaseKey = (key: string) => { setSupabaseKey(key); localStorage.setItem('supabaseKey', key); };

  // --- Generic Cleanup ---
  const cleanupAudio = useCallback((stopPlayback = true) => {
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
    micStreamSourceRef.current?.disconnect();
    micStreamSourceRef.current = null;
    
    if (stopPlayback) {
        for (const source of sourcesRef.current.values()) { source.stop(); }
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }

    if (inputAudioContextRef.current?.state !== 'closed') { inputAudioContextRef.current?.close().catch(console.error); inputAudioContextRef.current = null; }
    if (outputAudioContextRef.current?.state !== 'closed') { outputAudioContextRef.current?.close().catch(console.error); outputAudioContextRef.current = null; }
  }, []);
  
  // --- Gemini Mode ---
  const stopGeminiConversation = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then((session) => session.close()).catch(console.error);
        sessionPromiseRef.current = null;
    }
    cleanupAudio();
    setAppState('idle');
    setCurrentTurn({ user: '', model: '' });
  }, [cleanupAudio]);

  const startGeminiConversation = useCallback(async () => {
    setError(null);
    setAppState('connecting');
    if (!supabaseClient) setTranscriptHistory([]); // Clear history if supabase is not connected
    setCurrentTurn({ user: '', model: '' });
    try {
        if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set for Gemini.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {}, outputAudioTranscription: {},
                systemInstruction: 'You are a helpful and friendly conversational AI. Your responses should be concise and conversational.',
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice } },
                },
            },
            callbacks: {
                onopen: () => {
                    setAppState('listening');
                    const source = inputAudioContextRef.current!.createMediaStreamSource(micStreamRef.current!);
                    micStreamSourceRef.current = source;
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    processorRef.current = scriptProcessor;
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        sessionPromiseRef.current?.then((s) => s.sendRealtimeInput({ media: createBlob(inputData) }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const { outputTranscription, inputTranscription, turnComplete, modelTurn, interrupted } = message.serverContent ?? {};
                    if(inputTranscription) setCurrentTurn(p => ({...p, user: p.user + inputTranscription.text}));
                    if(outputTranscription) setCurrentTurn(p => ({...p, model: p.model + outputTranscription.text}));
                    if (turnComplete) {
                        setCurrentTurn(p => {
                            const newTurn = { id: Date.now(), user: p.user, model: p.model };
                            setTranscriptHistory(h => [...h, newTurn]);
                            if (supabaseClient && sessionIdRef.current) saveChatTurn(sessionIdRef.current, { user: p.user, model: p.model });
                            return { user: '', model: '' };
                        });
                    }
                    const audioDataB64 = modelTurn?.parts[0]?.inlineData?.data;
                    if (audioDataB64 && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioDataB64), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        source.addEventListener('ended', () => sourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                    if (interrupted) {
                        for (const source of sourcesRef.current.values()) { source.stop(); }
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => { setError(`Connection error: ${e.message}`); setAppState('error'); cleanupAudio(); },
                onclose: () => { cleanupAudio(); setAppState('idle'); }
            }
        });
    } catch (err: any) { setError(err.message); setAppState('error'); cleanupAudio(); }
  }, [cleanupAudio, supabaseClient, geminiVoice]);

  // --- Self-Hosted Mode ---
  const stopSelfHostedConversation = useCallback(() => {
    wasStoppedManuallyRef.current = true;
    if (recognition) recognition.stop();
    cleanupAudio();
    setAppState('idle');
  }, [cleanupAudio]);

  const startSelfHostedConversation = useCallback(async () => {
    if (!recognition) { setError("Web Speech API is not supported by this browser."); setAppState('error'); return; }
    if (!supabaseClient) { setError("Please configure Supabase in settings to use self-hosted mode."); setAppState('error'); setIsSettingsOpen(true); return; }
    
    setError(null);
    setAppState('listening');
    if (!supabaseClient) setTranscriptHistory([]);
    setCurrentTurn({ user: '', model: '' });
    finalTranscriptRef.current = '';
    wasStoppedManuallyRef.current = false;

    recognition.onresult = (event) => {
        let interim = '', final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript;
            else interim += event.results[i][0].transcript;
        }
        finalTranscriptRef.current = final;
        setCurrentTurn({ user: final || interim, model: '' });
    };

    recognition.onend = async () => {
        if (wasStoppedManuallyRef.current) return;
        const userTranscript = finalTranscriptRef.current.trim();
        if (!userTranscript) { setAppState('idle'); return; }
        setAppState('processing');
        try {
            let finalPrompt = userTranscript;
            const context = await performRagSearch(userTranscript);
            if (context) {
                finalPrompt = `Using the following context, answer the question.\n\nContext:\n${context}\n\nQuestion: ${userTranscript}`;
            }

            // Call the secure LLM proxy function
            const { data: llmResult, error: llmError } = await supabaseClient.functions.invoke('llm-proxy', {
                body: { prompt: finalPrompt, model: llmModel }
            });

            if (llmError) throw new Error(`LLM Proxy Error: ${llmError.message}`);
            const modelResText = llmResult.responseText;
            if (!modelResText) throw new Error("Did not receive standardized LLM response from proxy.");
            setCurrentTurn(p => ({ ...p, model: modelResText }));
            
            // Call the secure TTS proxy function
            const { data: ttsResult, error: ttsError } = await supabaseClient.functions.invoke('tts-proxy', {
                body: { text: modelResText }
            });
            if (ttsError) throw new Error(`TTS Proxy Error: ${ttsError.message}`);
            const audioB64 = ttsResult.audioContent;
            if (!audioB64) throw new Error("Did not receive standardized TTS response from proxy.");

            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (outputAudioContextRef.current?.state === 'closed' || !outputAudioContextRef.current) outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(audioB64), outputAudioContextRef.current!, 24000, 1);
            const source = outputAudioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current!.destination);
            source.start();
            source.onended = () => {
                const newTurn = { id: Date.now(), user: userTranscript, model: modelResText };
                setTranscriptHistory(h => [...h, newTurn]);
                if (supabaseClient && sessionIdRef.current) saveChatTurn(sessionIdRef.current, { user: userTranscript, model: modelResText });
                setCurrentTurn({ user: '', model: '' });
                setAppState('idle');
                cleanupAudio(false);
            };
        } catch (err: any) { setError(err.message); setAppState('error'); }
    };

    recognition.onerror = (e) => {
        if (e.error === 'no-speech') { setAppState('idle'); return; }
        setError(`Speech recognition error: ${e.error}`);
        setAppState('error');
    };
    
    try {
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
    } catch (err: any) { setError(`Microphone access denied: ${err.message}`); setAppState('error'); cleanupAudio(); }

  }, [cleanupAudio, supabaseClient, llmModel]);

  // --- Main Controller ---
  const toggleConversation = () => {
    if (appState === 'listening') {
        if(serviceMode === 'gemini') stopGeminiConversation();
        else stopSelfHostedConversation();
    } else if (appState === 'idle' || appState === 'error') {
        if (serviceMode === 'gemini') startGeminiConversation();
        else startSelfHostedConversation();
    }
  };
  
  // Cleanup on unmount or mode switch
  useEffect(() => {
    return () => {
      if (serviceMode === 'gemini') stopGeminiConversation();
      else stopSelfHostedConversation();
    };
  }, [serviceMode, stopGeminiConversation, stopSelfHostedConversation]);

  return (
    <>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        serviceMode={serviceMode} 
        setServiceMode={handleSetServiceMode}
        geminiVoice={geminiVoice}
        setGeminiVoice={handleSetGeminiVoice}
        llmModel={llmModel}
        setLlmModel={handleSetLlmModel}
        supabaseUrl={supabaseUrl}
        setSupabaseUrl={handleSetSupabaseUrl}
        supabaseKey={supabaseKey}
        setSupabaseKey={handleSetSupabaseKey}
      />
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-between p-4 md:p-8">
        <header className="w-full max-w-4xl text-center relative">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AI Voice Chat
          </h1>
          <p className="text-gray-400 mt-2">Speak and listen to your chosen AI in real-time.</p>
          <button onClick={() => setIsSettingsOpen(true)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors" aria-label="Open settings">
              <SettingsIcon />
          </button>
        </header>
        <TranscriptView history={transcriptHistory} currentTurn={currentTurn} />
        <footer className="w-full flex flex-col items-center justify-center space-y-6">
            <StatusIndicator appState={appState} error={error} />
            <ControlButton appState={appState} onClick={toggleConversation} />
        </footer>
      </div>
    </>
  );
};

export default App;
export type AppState = 'idle' | 'connecting' | 'listening' | 'processing' | 'error';
export type ServiceMode = 'gemini' | 'self-hosted';

export interface TranscriptTurn {
  id: number;
  user: string;
  model: string;
}

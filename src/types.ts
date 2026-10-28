export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type CompanionState = 'idle' | 'listening' | 'speaking' | 'thinking';

export interface VoiceOption {
  id: string;
  name: string;
  style: string;
  description: string;
  color: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  greeting: string;
  flag: string;
  region?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'serenade';
  text: string;
  timestamp: Date;
  isLiveTranscript?: boolean;
}

export type AmbientSoundType = 'none' | 'rain' | 'waves' | 'hearth' | 'zen';

export interface AmbientSoundOption {
  id: AmbientSoundType;
  name: string;
  description: string;
  icon: string;
}

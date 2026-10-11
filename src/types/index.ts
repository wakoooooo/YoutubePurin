export interface User {
  id: string;
  name: string;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface FloatingReaction {
  id: string;
  type: 'flan' | 'patita' | 'huesito' | 'amor';
  label: string;
  x: number;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  videoId: string;
  videoTitle: string;
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: number;
  users: User[];
}

export interface User {
  id: string;
  name: string;
  isHost: boolean;
}

export type BubbleThemeId = 'flan' | 'caramelo' | 'fresa' | 'matcha' | 'lavanda';

export interface BubbleCustomization {
  themeId: BubbleThemeId;
  avatarExpression: ':3' | '(^w^)' | '(o.o)' | '(u.u)';
  borderRadius: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  customization?: BubbleCustomization;
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

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { ChatMessage, BubbleCustomization } from '../types';

export interface VideoSyncPayload {
  action: 'play' | 'pause' | 'change_video' | 'heartbeat';
  videoId: string;
  senderName: string;
  senderId: string;
  timestamp: number;
}

export interface RoomSyncCallbacks {
  onPresenceUpdate: (count: number) => void;
  onVideoSync: (payload: VideoSyncPayload) => void;
  onChatMessage: (message: ChatMessage) => void;
}

export class RoomSyncService {
  private channel: RealtimeChannel | null = null;
  private roomId: string = '';
  private userId: string = '';
  private userName: string = '';
  private isHost: boolean = false;

  private isSubscribed: boolean = false;
  private pendingVideoActions: VideoSyncPayload[] = [];
  private pendingChatMessages: ChatMessage[] = [];

  public connect(
    roomId: string,
    userId: string,
    userName: string,
    isHost: boolean,
    callbacks: RoomSyncCallbacks
  ): void {
    if (!isSupabaseConfigured()) {
      return;
    }

    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.isHost = isHost;
    this.isSubscribed = false;

    const channelName = `purin_room_${roomId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    // Control de presencia (usuarios conectados)
    this.channel.on('presence', { event: 'sync' }, () => {
      if (!this.channel) return;
      const state = this.channel.presenceState();
      const count = Object.keys(state).length;
      callbacks.onPresenceUpdate(Math.max(1, count));
    });

    // Escucha de sincronizacion de video
    this.channel.on(
      'broadcast',
      { event: 'video_sync' },
      ({ payload }: { payload: VideoSyncPayload }) => {
        if (payload && payload.senderId !== this.userId) {
          callbacks.onVideoSync(payload);
        }
      }
    );

    // Escucha de mensajes de chat en tiempo real
    this.channel.on(
      'broadcast',
      { event: 'chat_message' },
      ({ payload }: { payload: ChatMessage }) => {
        if (payload && payload.userId !== this.userId) {
          callbacks.onChatMessage(payload);
        }
      }
    );

    // Suscribirse y registrar presencia
    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && this.channel) {
        this.isSubscribed = true;
        await this.channel.track({
          userId: this.userId,
          userName: this.userName,
          isHost: this.isHost,
          joinedAt: Date.now(),
        });

        // Vaciar acciones pendientes acumuladas antes del enlace
        while (this.pendingVideoActions.length > 0) {
          const act = this.pendingVideoActions.shift();
          if (act) {
            this.channel.send({
              type: 'broadcast',
              event: 'video_sync',
              payload: act,
            });
          }
        }

        while (this.pendingChatMessages.length > 0) {
          const msg = this.pendingChatMessages.shift();
          if (msg) {
            this.channel.send({
              type: 'broadcast',
              event: 'chat_message',
              payload: msg,
            });
          }
        }
      }
    });
  }

  public sendVideoAction(
    action: 'play' | 'pause' | 'change_video',
    videoId: string
  ): void {
    if (!isSupabaseConfigured()) return;

    const payload: VideoSyncPayload = {
      action,
      videoId,
      senderName: this.userName,
      senderId: this.userId,
      timestamp: Date.now(),
    };

    if (this.channel && this.isSubscribed) {
      this.channel.send({
        type: 'broadcast',
        event: 'video_sync',
        payload,
      });
    } else {
      this.pendingVideoActions.push(payload);
    }
  }

  public sendChatMessage(message: ChatMessage): void {
    if (!isSupabaseConfigured()) return;

    if (this.channel && this.isSubscribed) {
      this.channel.send({
        type: 'broadcast',
        event: 'chat_message',
        payload: message,
      });
    } else {
      this.pendingChatMessages.push(message);
    }
  }

  public disconnect(): void {
    this.isSubscribed = false;
    this.pendingVideoActions = [];
    this.pendingChatMessages = [];
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

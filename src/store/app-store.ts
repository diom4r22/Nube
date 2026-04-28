import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AudioTrack = 'none' | 'rain' | 'piano' | 'lofi';

export interface UserProfile {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  audioTrack: AudioTrack;
  setAudioTrack: (track: AudioTrack) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;

  sunEmotion: 'neutral' | 'happy' | 'curious' | 'sleeping';
  setSunEmotion: (emotion: 'neutral' | 'happy' | 'curious' | 'sleeping') => void;
  triggerHappySun: () => void;

  currentUser: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;

  requestPurge: number;
  triggerPurge: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),

      audioTrack: 'none',
      setAudioTrack: (track) => set({ audioTrack: track }),
      isPlaying: false,
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      volume: 0.5,
      setVolume: (volume) => set({ volume }),

      sunEmotion: 'neutral',
      setSunEmotion: (emotion) => set({ sunEmotion: emotion }),
      triggerHappySun: () => {
        set({ sunEmotion: 'happy' });
        setTimeout(() => set({ sunEmotion: 'neutral' }), 3000);
      },

      currentUser: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      requestPurge: 0,
      triggerPurge: () => set((state) => ({ requestPurge: state.requestPurge + 1 })),
    }),
    {
      name: 'nube-serena-storage',
      partialize: (state) => ({
        theme: state.theme,
        audioTrack: state.audioTrack,
        volume: state.volume,
        currentUser: state.currentUser,
      }),
    }
  )
);

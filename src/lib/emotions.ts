export type EmotionType = 'pensamiento' | 'pregunta' | 'confesion' | 'idea' | 'amor' | 'tristeza' | 'alegria';

export const EMOTIONS_DATA: Record<EmotionType, { label: string; color: string; icon: string }> = {
  confesion: { label: 'Confesión', color: 'from-pink-100 to-rose-50 dark:from-pink-900/40 dark:to-rose-800/20', icon: '(⁄ ⁄>⁄▽⁄<⁄ ⁄)' },
  amor: { label: 'Amor', color: 'from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/30', icon: '(♡´▽`♡)' },
  pregunta: { label: 'Pregunta', color: 'from-yellow-100 to-cyan-50 dark:from-yellow-900/30 dark:to-cyan-900/20', icon: '(・・?)' },
  pensamiento: { label: 'Pensamiento', color: 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20', icon: '(  ̄ー ̄)' },
  idea: { label: 'Idea', color: 'from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30', icon: '(☆▽☆)' },
  tristeza: { label: 'Tristeza', color: 'from-slate-100 to-violet-100 dark:from-slate-800/50 dark:to-violet-900/30', icon: '(ᴗ̩̩̩ɜ)' },
  alegria: { label: 'Alegría', color: 'from-orange-100 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/30', icon: '(◕‿◕✿)' },
};

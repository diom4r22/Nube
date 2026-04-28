export type EmotionCategory = 'pensamiento' | 'pregunta' | 'confesion' | 'idea' | 'amor' | 'tristeza' | 'alegria';

export interface CloudTheme {
  fill: string;
  accent: string;
  text: string;
  mutedText: string;
  badge: string;
  icon: string;
  faceMood: 'shy' | 'in-love' | 'curious' | 'thoughtful' | 'inspired' | 'tender-sad' | 'smiling';
  reactionParticles: 'hearts' | 'pink-hearts' | 'sparkles' | 'stars' | 'droplets' | 'mist';
  label: string;
}

export const cloudThemes: Record<EmotionCategory, CloudTheme> = {
  confesion: {
    fill: 'fill-purple-100/90 dark:fill-purple-950/80',
    accent: 'text-purple-400',
    text: 'text-purple-900 dark:text-purple-100',
    mutedText: 'text-purple-700/60 dark:text-purple-300/60',
    badge: 'bg-purple-200/50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-300',
    icon: '(⁄ ⁄>⁄▽⁄<⁄ ⁄)',
    faceMood: 'shy',
    reactionParticles: 'pink-hearts',
    label: 'Confesión'
  },
  amor: {
    fill: 'fill-rose-100/90 dark:fill-rose-950/80',
    accent: 'text-rose-400',
    text: 'text-rose-900 dark:text-rose-100',
    mutedText: 'text-rose-700/60 dark:text-rose-300/60',
    badge: 'bg-rose-200/50 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border-rose-300',
    icon: '(♡´▽`♡)',
    faceMood: 'in-love',
    reactionParticles: 'hearts',
    label: 'Amor'
  },
  pregunta: {
    fill: 'fill-emerald-50/90 dark:fill-emerald-950/40',
    accent: 'text-emerald-400',
    text: 'text-emerald-900 dark:text-emerald-100',
    mutedText: 'text-emerald-700/60 dark:text-emerald-300/60',
    badge: 'bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200',
    icon: '(・・?)',
    faceMood: 'curious',
    reactionParticles: 'sparkles',
    label: 'Pregunta'
  },
  pensamiento: {
    fill: 'fill-indigo-50/90 dark:fill-indigo-950/80',
    accent: 'text-indigo-400',
    text: 'text-indigo-900 dark:text-indigo-100',
    mutedText: 'text-indigo-700/60 dark:text-indigo-300/60',
    badge: 'bg-indigo-200/50 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-300',
    icon: '(  ̄ー ̄)',
    faceMood: 'thoughtful',
    reactionParticles: 'mist',
    label: 'Pensamiento'
  },
  idea: {
    fill: 'fill-cyan-50/90 dark:fill-cyan-950/80',
    accent: 'text-cyan-400',
    text: 'text-cyan-900 dark:text-cyan-100',
    mutedText: 'text-cyan-700/60 dark:text-cyan-300/60',
    badge: 'bg-cyan-200/50 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200 border-cyan-300',
    icon: '(☆▽☆)',
    faceMood: 'inspired',
    reactionParticles: 'stars',
    label: 'Idea'
  },
  tristeza: {
    fill: 'fill-blue-100/90 dark:fill-blue-900/80',
    accent: 'text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    mutedText: 'text-blue-700/60 dark:text-blue-300/60',
    badge: 'bg-blue-300/50 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200 border-blue-400',
    icon: '(ᴗ̩̩̩ɜ)',
    faceMood: 'tender-sad',
    reactionParticles: 'droplets',
    label: 'Tristeza'
  },
  alegria: {
    fill: 'fill-yellow-100/90 dark:fill-yellow-950/80',
    accent: 'text-yellow-500',
    text: 'text-yellow-900 dark:text-yellow-100',
    mutedText: 'text-yellow-700/60 dark:text-yellow-300/60',
    badge: 'bg-yellow-200/50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-300',
    icon: '(◕‿◕✿)',
    faceMood: 'smiling',
    reactionParticles: 'sparkles',
    label: 'Alegría'
  }
};

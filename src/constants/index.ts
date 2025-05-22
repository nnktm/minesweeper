export const STANDARD_LEVEL_KEYS = ['easy', 'middle', 'hard'] as const;

export const CUSTOM_LEVEL_KEY = 'custom';

export const LEVEL_KEYS = [...STANDARD_LEVEL_KEYS, CUSTOM_LEVEL_KEY] as const;

export const LEVEL_NAMES: Record<(typeof LEVEL_KEYS)[number], string> = {
  easy: '初級',
  middle: '中級',
  hard: '上級',
  custom: 'カスタム',
};

export type BoardSetting = { width: number; height: number; bombCount: number };

export const STANDARD_SETTINGS: Record<(typeof STANDARD_LEVEL_KEYS)[number], BoardSetting> = {
  easy: { width: 9, height: 9, bombCount: 10 },
  middle: { width: 16, height: 16, bombCount: 40 },
  hard: { width: 30, height: 16, bombCount: 99 },
};

export type BoardSettings = Record<(typeof LEVEL_KEYS)[number], BoardSetting>;

export type LevelKey = (typeof LEVEL_KEYS)[number];

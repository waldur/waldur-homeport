import { vi } from 'vitest';

vi.mock('@/i18n/LanguageUtilsService', () => ({
  LanguageUtilsService: {
    getCurrentLanguage: vi.fn(() => ({ code: 'en', label: 'English' })),
    getChoices: vi.fn(() => [{ code: 'en', label: 'English' }]),
    dictionary: {},
  },
  getUserLocale: vi.fn(() => 'en'),
  numberFormatter: {
    format: vi.fn((val) => val.toString()),
  },
}));

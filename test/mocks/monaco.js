/* eslint-disable no-undef */
import { vi } from 'vitest';

vi.mock('@monaco-editor/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    Editor: vi.fn(({ value, onChange, 'data-testid': testId }) => {
      return React.createElement('textarea', {
        'data-testid': testId || 'monaco-editor',
        value: value || '',
        onChange: (e) => {
          if (onChange) onChange(e.target.value);
        },
      });
    }),
  };
});

vi.mock('@/form/monacoSetup', () => {
  return {
    initMonaco: vi.fn().mockResolvedValue({
      languages: {
        register: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
      },
    }),
  };
});

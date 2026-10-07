import React from 'react';
import { vi } from 'vitest';

vi.mock('@monaco-editor/react', () => {
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
    DiffEditor: vi.fn(({ 'data-testid': testId }) => {
      return React.createElement('div', {
        'data-testid': testId || 'monaco-diff-editor',
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

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getFileLanguage, HpcScriptViewer } from './HpcScriptViewer';

vi.mock('@/form/MonacoEditor', () => ({
  MonacoEditor: ({ value, language }) => (
    <pre data-testid="editor" data-language={language}>
      {value}
    </pre>
  ),
}));

describe('getFileLanguage', () => {
  it('reads the language from the extension', () => {
    expect(getFileLanguage('matmul.py')).toBe('python');
    expect(getFileLanguage('run.SH')).toBe('shell');
    expect(getFileLanguage('Makefile')).toBe('plaintext');
  });
});

describe('HpcScriptViewer', () => {
  it('opens on the program, highlighted as its own language', async () => {
    render(
      <HpcScriptViewer
        script="#!/bin/bash"
        files={[{ name: 'matmul.py', content: 'print(1)' }]}
        height={300}
      />,
    );
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(tabs).toEqual(['matmul.py', 'Batch script']);
    const editor = await screen.findByTestId('editor');
    expect(editor).toHaveTextContent('print(1)');
    expect(editor).toHaveAttribute('data-language', 'python');
  });

  it('shows the batch script alone when the job writes no files', async () => {
    render(<HpcScriptViewer script="#!/bin/bash" height={300} />);
    expect(await screen.findByTestId('editor')).toHaveAttribute(
      'data-language',
      'shell',
    );
  });
});

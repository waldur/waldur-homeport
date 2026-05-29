import { vi } from 'vitest';

vi.mock('@/form/MarkdownEditor', () => ({
  default: ({ input }: any) => (
    <textarea
      data-testid="markdown-editor"
      value={input?.value || ''}
      onChange={(e) => input?.onChange?.(e.target.value)}
    />
  ),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CopyFeedbackProvider } from './CopyButton';
import { CopyToClipboardButton } from './CopyToClipboardButton';

const stubClipboard = (writeText: (value: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });

describe('CopyToClipboardButton', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
  });

  it('keeps its button when the parent re-renders', () => {
    const { rerender } = render(<CopyToClipboardButton value="a" />);
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });

    rerender(<CopyToClipboardButton value="b" />);

    expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBe(
      button,
    );
  });

  it('shows its tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(<CopyToClipboardButton value="a" label="Copy API token" />);

    await user.tab();

    expect(
      screen.getByRole('button', { name: 'Copy API token' }),
    ).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Copy API token',
    );
  });

  it('reports a successful copy', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();
    render(
      <CopyFeedbackProvider onCopied={onCopied}>
        <CopyToClipboardButton value="secret" verbose="Token" />
      </CopyFeedbackProvider>,
    );
    stubClipboard(writeText);

    await user.click(screen.getByRole('button'));

    expect(writeText).toHaveBeenCalledWith('secret');
    await waitFor(() =>
      expect(onCopied).toHaveBeenCalledWith({ value: 'secret', name: 'Token' }),
    );
  });

  it('reports nothing when the browser refuses the copy', async () => {
    const user = userEvent.setup();
    const onCopied = vi.fn();
    render(
      <CopyFeedbackProvider onCopied={onCopied}>
        <CopyToClipboardButton value="secret" />
      </CopyFeedbackProvider>,
    );
    stubClipboard(() => Promise.reject(new Error('denied')));

    await user.click(screen.getByRole('button'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onCopied).not.toHaveBeenCalled();
  });
});

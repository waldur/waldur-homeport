import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TruncatedDescription } from './TruncatedDescription';

const text = 'word '.repeat(60).trim();

describe('TruncatedDescription', () => {
  it('shows short text whole', () => {
    render(<TruncatedDescription text="Short" />);
    expect(screen.getByText('Short')).toBeInTheDocument();
  });

  it('cuts long text to max characters, ellipsis included', async () => {
    render(<TruncatedDescription text={text} max={20} />);
    expect(
      screen.getByText('word word word wo...', { exact: false }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Show more/ }));
    expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
  });
});

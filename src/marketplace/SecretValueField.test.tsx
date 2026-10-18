import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SecretValueField } from './SecretValueField';

describe('SecretValueField', () => {
  // A password input cannot be copied from, and this value is shown to be
  // copied, so it is a text input drawn in the masking font.
  it('masks the value without making it a password input', () => {
    render(<SecretValueField value="s3cr3t" />);
    const input = screen.getByDisplayValue('s3cr3t');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveStyle({ fontFamily: 'text-security-disc' });
  });

  it('shows the value in the normal font once revealed', async () => {
    render(<SecretValueField value="s3cr3t" />);
    await userEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(screen.getByDisplayValue('s3cr3t')).not.toHaveStyle({
      fontFamily: 'text-security-disc',
    });
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
  });
});

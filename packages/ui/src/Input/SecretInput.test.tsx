import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SecretInput } from './SecretInput';

describe('SecretInput', () => {
  it('masks the value until it is shown', async () => {
    render(<SecretInput aria-label="Token" defaultValue="s3cr3t" />);
    const input = screen.getByLabelText('Token');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    await userEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(
      screen.getByRole('button', { name: 'Show', pressed: true }),
    );
    expect(input).toHaveAttribute('type', 'password');
  });

  it('passes invalid and readOnly through', () => {
    render(<SecretInput aria-label="Token" invalid readOnly value="x" />);
    const input = screen.getByLabelText('Token');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('readonly');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { UserPassword } from './UserPassword';

describe('UserPassword', () => {
  const user = userEvent.setup();

  it('renders placeholder and open eye icon by default', () => {
    render(<UserPassword password="secret" />);
    expect(screen.getByText('***************')).toBeInTheDocument();
    expect(screen.getByTestId('eye')).toBeInTheDocument();
  });

  it('renders password and closed eye icon when user click on toggle icon', async () => {
    render(<UserPassword password="secret" />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(screen.getByTestId('eye-slash')).toBeInTheDocument();
  });
});

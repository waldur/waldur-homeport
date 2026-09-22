import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redirectOnSuccess } from './authNavigation';
import * as AuthService from './AuthService';
import { SigninForm } from './SigninForm';

vi.mock('./AuthService', () => ({
  signin: vi.fn(),
  signinByToken: vi.fn(),
  loginUser: vi.fn(),
}));

vi.mock('./authNavigation', () => ({
  redirectOnSuccess: vi.fn(),
}));

describe('SigninForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the auth method switch as a named tab list with Username default', () => {
    render(<SigninForm />);

    expect(
      screen.getByRole('tablist', { name: 'Sign in method' }),
    ).toBeInTheDocument();

    const usernameTab = screen.getByRole('tab', { name: 'Username' });
    const tokenTab = screen.getByRole('tab', { name: 'Access token' });

    expect(usernameTab).toHaveAttribute('aria-selected', 'true');
    expect(tokenTab).toHaveAttribute('aria-selected', 'false');

    expect(
      screen.getByPlaceholderText('Enter your username'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your password'),
    ).toBeInTheDocument();
  });

  it('switches to token tab and renders token input on click', async () => {
    const user = userEvent.setup();
    render(<SigninForm />);

    await user.click(screen.getByRole('tab', { name: 'Access token' }));

    expect(screen.getByRole('tab', { name: 'Access token' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Username' })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    expect(
      screen.getByPlaceholderText('Paste here your token'),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Enter your username'),
    ).not.toBeInTheDocument();
  });

  it('switches tabs with keyboard arrows', async () => {
    const user = userEvent.setup();
    render(<SigninForm />);

    const usernameTab = screen.getByRole('tab', { name: 'Username' });
    usernameTab.focus();

    await user.keyboard('{ArrowRight}');

    const tokenTab = screen.getByRole('tab', { name: 'Access token' });
    expect(tokenTab).toHaveAttribute('aria-selected', 'true');
    expect(tokenTab).toHaveFocus();
    expect(
      screen.getByPlaceholderText('Paste here your token'),
    ).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');

    expect(usernameTab).toHaveAttribute('aria-selected', 'true');
    expect(usernameTab).toHaveFocus();
    expect(
      screen.getByPlaceholderText('Enter your username'),
    ).toBeInTheDocument();
  });

  it('submits credentials in username mode', async () => {
    const user = userEvent.setup();
    vi.mocked(AuthService.signin).mockResolvedValue({ status: 'ok' } as any);

    render(<SigninForm />);

    await user.type(
      screen.getByPlaceholderText('Enter your username'),
      'alice',
    );
    await user.type(
      screen.getByPlaceholderText('Enter your password'),
      'secret',
    );
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(AuthService.signin).toHaveBeenCalledWith('alice', 'secret');
      expect(redirectOnSuccess).toHaveBeenCalled();
    });
  });

  it('submits token in token mode', async () => {
    const user = userEvent.setup();
    vi.mocked(AuthService.signinByToken).mockResolvedValue(undefined as any);

    render(<SigninForm />);

    await user.click(screen.getByRole('tab', { name: 'Access token' }));
    await user.type(
      screen.getByPlaceholderText('Paste here your token'),
      'my-secret-token',
    );
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(AuthService.signinByToken).toHaveBeenCalledWith('my-secret-token');
      expect(redirectOnSuccess).toHaveBeenCalled();
    });
  });
});

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthLoginFailed } from './AuthLoginFailed';

const { getQueryStringMock } = vi.hoisted(() => ({
  getQueryStringMock: vi.fn(),
}));

vi.mock('@/core/utils', () => ({
  getQueryString: getQueryStringMock,
}));

vi.mock('@/core/Link', () => ({
  Link: ({ children }) => <span>{children}</span>,
}));

describe('AuthLoginFailed', () => {
  beforeEach(() => {
    getQueryStringMock.mockReset();
  });

  it('renders URLs in the message as clickable links', () => {
    getQueryStringMock.mockReturnValue(
      'message=Apply at https://access.example.eu/ for access.',
    );
    render(<AuthLoginFailed />);
    const link = screen.getByRole('link', {
      name: 'https://access.example.eu/',
    });
    expect(link.getAttribute('href')).toBe('https://access.example.eu/');
  });

  it('shows no message block when none is provided', () => {
    getQueryStringMock.mockReturnValue('');
    render(<AuthLoginFailed />);
    expect(screen.queryByTestId('login-failed-message')).toBeNull();
  });

  it('renders nothing when the message is not a string (array/object query)', () => {
    getQueryStringMock.mockReturnValue('message=a&message=b');
    render(<AuthLoginFailed />);
    expect(screen.queryByTestId('login-failed-message')).toBeNull();
  });
});

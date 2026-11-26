import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthLogoutFailed } from './AuthLogoutFailed';

const { getQueryStringMock } = vi.hoisted(() => ({
  getQueryStringMock: vi.fn(),
}));

vi.mock('@/core/utils', () => ({
  getQueryString: getQueryStringMock,
}));

vi.mock('../authNavigation', () => ({
  explicitLogout: vi.fn(),
}));

const renderQuery = (query: string) => {
  getQueryStringMock.mockReturnValue(query);
  render(<AuthLogoutFailed />);
  return screen.getByTestId('logout-failed-message').textContent;
};

const GENERIC = 'Logout could not be completed.';

describe('AuthLogoutFailed', () => {
  beforeEach(() => {
    getQueryStringMock.mockReset();
  });

  it('ignores a message in the URL', () => {
    expect(
      renderQuery(
        `message=${encodeURIComponent('Your session expired, sign in at attacker.example')}`,
      ),
    ).toBe(GENERIC);
  });

  it.each([
    ['saml2_logout_failed', 'Remote SAML2 logout has failed.'],
    ['saml2_not_logged_in', 'You are not logged in to any identity provider.'],
    [
      'saml2_logout_wrong_session',
      'The identity provider asked to log out a different session.',
    ],
    ['saml2_logout_invalid', 'The logout message could not be processed.'],
  ])('shows the text for %s', (code, text) => {
    expect(renderQuery(`code=${code}`)).toBe(text);
  });

  it('shows a generic message for a missing code', () => {
    expect(renderQuery('')).toBe(GENERIC);
  });

  it('shows a generic message for an unknown code', () => {
    expect(renderQuery('code=whatever')).toBe(GENERIC);
  });

  it('shows a generic message for a repeated code', () => {
    expect(renderQuery('code=a&code=b')).toBe(GENERIC);
  });
});

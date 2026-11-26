import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import {
  AuthLoginFailed,
  linkifyMessage,
  normalizeMessage,
} from './AuthLoginFailed';

const { getQueryStringMock } = vi.hoisted(() => ({
  getQueryStringMock: vi.fn(),
}));

vi.mock('@/core/utils', () => ({
  getQueryString: getQueryStringMock,
}));

vi.mock('@/core/Link', () => ({
  Link: ({ children }) => <span>{children}</span>,
}));

const renderQuery = (query: string) => {
  getQueryStringMock.mockReturnValue(query);
  render(<AuthLoginFailed />);
  return screen.getByTestId('login-failed-message');
};

const renderLinkified = (text: string) => {
  render(<p data-testid="out">{linkifyMessage(normalizeMessage(text))}</p>);
  return screen.getByTestId('out');
};

describe('AuthLoginFailed', () => {
  const core = ENV.plugins.WALDUR_CORE;
  const saved = {
    blocked: core.OIDC_BLOCKED_LOGIN_RESPONSE_MESSAGE,
    uninvited: core.OIDC_BLOCK_CREATION_OF_UNINVITED_USERS_RESPONSE_MESSAGE,
  };

  beforeEach(() => {
    getQueryStringMock.mockReset();
  });

  afterEach(() => {
    core.OIDC_BLOCKED_LOGIN_RESPONSE_MESSAGE = saved.blocked;
    core.OIDC_BLOCK_CREATION_OF_UNINVITED_USERS_RESPONSE_MESSAGE =
      saved.uninvited;
  });

  it('ignores a message in the URL', () => {
    const block = renderQuery(
      `message=${encodeURIComponent('Session expired, sign in at https://attacker.example/')}`,
    );
    expect(block.textContent).not.toContain('attacker');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows a generic message for a missing or unknown code', () => {
    expect(renderQuery('').textContent).toBe(
      'Sign-in could not be completed. Please try again.',
    );
  });

  it('shows a generic message for an unknown code', () => {
    expect(renderQuery('code=whatever').textContent).toBe(
      'Sign-in could not be completed. Please try again.',
    );
  });

  it('shows a generic message for an array or object code', () => {
    expect(renderQuery('code=a&code=b').textContent).toBe(
      'Sign-in could not be completed. Please try again.',
    );
  });

  it('shows the text for a known code', () => {
    expect(renderQuery('code=oidc_invalid_state').textContent).toBe(
      'This sign-in has expired or was already used. Please sign in again.',
    );
  });

  it('shows the configured block message, with its URL linked', () => {
    core.OIDC_BLOCK_CREATION_OF_UNINVITED_USERS_RESPONSE_MESSAGE =
      'Apply at https://access.example.eu/ for access.';
    const block = renderQuery('code=oidc_uninvited');
    expect(block.textContent).toBe(
      'Apply at https://access.example.eu/ for access.',
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://access.example.eu/',
    );
  });

  it('falls back to a default when the block message is not configured', () => {
    core.OIDC_BLOCKED_LOGIN_RESPONSE_MESSAGE = '';
    expect(renderQuery('code=oidc_blocked').textContent).toBe(
      'Access to this deployment is restricted.',
    );
  });
});

describe('linkifyMessage', () => {
  it('shows HTML as text, without creating elements', () => {
    const payload =
      '<a href="//attacker.example" class="fixed inset-0">Session expired</a>';
    expect(renderLinkified(payload).textContent).toBe(payload);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not interpret markdown link syntax', () => {
    renderLinkified('[Sign in](https://example.com/)');
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('https://example.com/');
    expect(link.hasAttribute('class')).toBe(false);
  });

  it('keeps trailing punctuation out of a linked URL', () => {
    const block = renderLinkified('See https://access.example.eu/apply.');
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://access.example.eu/apply',
    );
    expect(block.textContent).toBe('See https://access.example.eu/apply.');
  });

  it('links only the http(s) part of a javascript: prefixed URL', () => {
    renderLinkified('javascript:https://example.com/');
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://example.com/',
    );
  });

  it('links an uppercase scheme with a normalised href', () => {
    renderLinkified('Go to HTTPS://Example.com/x');
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://example.com/x',
    );
  });

  it('links several URLs in one message', () => {
    renderLinkified('See https://a.example/ or https://b.example/.');
    expect(
      screen.getAllByRole('link').map((a) => a.getAttribute('href')),
    ).toEqual(['https://a.example/', 'https://b.example/']);
  });

  it('keeps balanced parentheses inside a URL', () => {
    renderLinkified('Read (https://en.wikipedia.org/wiki/Foo_(bar)).');
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'https://en.wikipedia.org/wiki/Foo_(bar)',
    );
  });

  it('does not link a URL that carries credentials', () => {
    const block = renderLinkified(
      'Sign in at https://trusted.example@evil.example/',
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(block.textContent).toContain(
      'https://trusted.example@evil.example/',
    );
  });

  it('shows a look-alike host in punycode', () => {
    renderLinkified('https://exаmple.com/');
    expect(screen.getByRole('link').textContent).toBe(
      'https://xn--exmple-4nf.com/',
    );
  });

  it('strips bidi controls and collapses blank lines', () => {
    const text =
      renderLinkified(`a‮b${'\n'.repeat(40)}c ${'x'.repeat(1000)}`)
        .textContent ?? '';
    expect(text).not.toContain('‮');
    expect(text.startsWith('ab\n\nc ')).toBe(true);
    expect(text.length).toBe(1006);
  });

  it('handles long punctuation runs quickly', () => {
    const started = performance.now();
    renderLinkified(`https://a.example/${'.'.repeat(400)}x`);
    expect(performance.now() - started).toBeLessThan(1000);
  });
});

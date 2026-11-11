import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { reauthenticateWithPassword, ReauthenticationCancelled } from './api';
import {
  cancelPendingReauthentication,
  requestReauthentication,
} from './prompt';
import { ReauthenticationRoot } from './ReauthenticationRoot';

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  reauthenticateWithPassword: vi.fn(),
}));

const CHALLENGE = {
  action: 'change_email',
  methods: ['password'],
  detail: 'Confirm your identity to make this change.',
};

describe('ReauthenticationRoot', () => {
  it('resolves the waiting request with the grant', async () => {
    vi.mocked(reauthenticateWithPassword).mockResolvedValue('the-grant');
    renderWithProviders(<ReauthenticationRoot />);

    let grant: Promise<string>;
    act(() => {
      grant = requestReauthentication(CHALLENGE);
    });

    await userEvent.type(await screen.findByLabelText('Password'), 'demo');
    await userEvent.click(screen.getByTestId('reauthentication-submit'));

    await expect(grant).resolves.toBe('the-grant');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('fails the waiting request with a clear message on cancel', async () => {
    renderWithProviders(<ReauthenticationRoot />);

    let grant: Promise<string>;
    act(() => {
      grant = requestReauthentication(CHALLENGE);
    });
    const outcome = grant.catch((reason) => reason);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel' }),
    );

    const reason = await outcome;
    expect(reason).toBeInstanceOf(ReauthenticationCancelled);
    expect(reason.code).toBe('reauthentication_cancelled');
    expect(reason.message).toBe(
      'Nothing was changed, because your identity was not confirmed.',
    );
  });

  it('points to support on cancel when no offered method works here', async () => {
    renderWithProviders(<ReauthenticationRoot />);

    let grant: Promise<string>;
    act(() => {
      grant = requestReauthentication({ ...CHALLENGE, methods: ['oidc'] });
    });
    const outcome = grant.catch((reason) => reason);

    await userEvent.click(
      within(await screen.findByTestId('modal-footer')).getByRole('button', {
        name: 'Close',
      }),
    );

    expect((await outcome).message).toBe(
      'Nothing was changed: your account cannot confirm your identity. Please contact support.',
    );
  });

  it('closes when the session ends, failing every waiting request', async () => {
    renderWithProviders(<ReauthenticationRoot />);

    let first: Promise<string>;
    let second: Promise<string>;
    act(() => {
      first = requestReauthentication(CHALLENGE);
      second = requestReauthentication(CHALLENGE);
    });
    const outcomes = Promise.all([
      first.catch((reason) => reason),
      second.catch((reason) => reason),
    ]);
    expect(await screen.findByRole('dialog')).toBeVisible();

    const ended = new ReauthenticationCancelled('The session ended.');
    act(() => cancelPendingReauthentication(ended));

    expect(await outcomes).toEqual([ended, ended]);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('asks for each waiting request in turn', async () => {
    vi.mocked(reauthenticateWithPassword)
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second');
    renderWithProviders(<ReauthenticationRoot />);

    let first: Promise<string>;
    let second: Promise<string>;
    act(() => {
      first = requestReauthentication(CHALLENGE);
      second = requestReauthentication({
        ...CHALLENGE,
        action: 'token_lifetime',
      });
    });

    await userEvent.type(await screen.findByLabelText('Password'), 'demo');
    await userEvent.click(screen.getByTestId('reauthentication-submit'));
    await expect(first).resolves.toBe('first');

    expect(
      await screen.findByText(
        "To change the API token lifetime, confirm it's you.",
      ),
    ).toBeVisible();
    await userEvent.type(screen.getByLabelText('Password'), 'demo');
    await userEvent.click(screen.getByTestId('reauthentication-submit'));
    await expect(second).resolves.toBe('second');
  });
});

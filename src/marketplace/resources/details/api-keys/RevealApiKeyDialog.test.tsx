import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RevealApiKeyDialog } from './RevealApiKeyDialog';
import { useRevealedApiKey } from './useResourceApiKeys';

vi.mock('./useResourceApiKeys', () => ({
  useRevealedApiKey: vi.fn(),
}));

const SECRET = 'sk-UgZG4fr0ZYsw5zoz82P8u0btLZ3xfjosOvbegJWxAX0';

const renderDialog = (canRotate = true, rotateDisabledReason?: string) =>
  renderWithProviders(
    <RevealApiKeyDialog
      resolve={{
        uuid: 'k1',
        canRotate,
        rotateDisabledReason,
        onRotate: vi.fn(),
      }}
    />,
  );

const revealed = () =>
  vi.mocked(useRevealedApiKey).mockReturnValue({
    value: SECRET,
    revealing: false,
    reveal: vi.fn().mockResolvedValue(SECRET),
  });

describe('RevealApiKeyDialog', () => {
  it('shows the revealed key as readable, selectable text', async () => {
    vi.mocked(useRevealedApiKey).mockReturnValue({
      value: SECRET,
      revealing: false,
      reveal: vi.fn().mockResolvedValue(SECRET),
    });

    renderDialog();

    const input = (await screen.findByDisplayValue(SECRET)) as HTMLInputElement;
    // readOnly rather than disabled: a disabled input renders its text muted and
    // cannot be selected, so the key would be unreadable and impossible to copy
    // by hand.
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(false);
  });

  it('reports a failed reveal instead of showing an empty field', async () => {
    vi.mocked(useRevealedApiKey).mockReturnValue({
      value: null,
      revealing: false,
      reveal: vi.fn().mockResolvedValue(null),
    });

    renderDialog();

    expect(
      await screen.findByText('Unable to reveal the API key.'),
    ).toBeInTheDocument();
  });

  it('offers rotation to whoever may rotate the key', async () => {
    revealed();
    renderDialog(true);
    await screen.findByDisplayValue(SECRET);
    expect(screen.getByRole('button', { name: 'Rotate' })).toBeEnabled();
  });

  it('offers no rotation to anyone else', async () => {
    revealed();
    renderDialog(false);
    await screen.findByDisplayValue(SECRET);
    expect(
      screen.queryByRole('button', { name: 'Rotate' }),
    ).not.toBeInTheDocument();
  });

  it('locks rotation it may not do now', async () => {
    revealed();
    renderDialog(
      true,
      'This key has reached its daily limit. A manager can rotate it.',
    );
    await screen.findByDisplayValue(SECRET);
    expect(screen.getByRole('button', { name: 'Rotate' })).toBeDisabled();
  });
});

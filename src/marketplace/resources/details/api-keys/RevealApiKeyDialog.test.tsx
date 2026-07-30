import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RevealApiKeyDialog } from './RevealApiKeyDialog';
import { useRevealedApiKey } from './useResourceApiKeys';

vi.mock('./useResourceApiKeys', () => ({
  useRevealedApiKey: vi.fn(),
}));

const SECRET = 'sk-UgZG4fr0ZYsw5zoz82P8u0btLZ3xfjosOvbegJWxAX0';

const renderDialog = (canManage = true) =>
  renderWithProviders(
    <RevealApiKeyDialog
      resolve={{ uuid: 'k1', canManage, onRotate: vi.fn() }}
    />,
  );

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
});

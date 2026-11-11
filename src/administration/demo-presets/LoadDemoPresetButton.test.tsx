import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceDemoPresetsLoad } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { LoadDemoPresetButton } from './LoadDemoPresetButton';
import { clearDemoReset, getDemoReset } from './resetState';

const renderButton = (onStarted = vi.fn()) => {
  renderWithProviders(
    <LoadDemoPresetButton
      name="hpc_ai_platform"
      title="HPC and AI platform"
      onStarted={onStarted}
    />,
  );
  return onStarted;
};

describe('LoadDemoPresetButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceDemoPresetsLoad).mockResolvedValue({
      data: { uuid: 'load-1', preset: 'hpc_ai_platform', state: 'pending' },
    } as any);
  });

  afterEach(() => {
    clearDemoReset();
  });

  it('asks for the preset name and warns that everyone is signed out', async () => {
    vi.mocked(useModal().confirm).mockReturnValue(new Promise(() => {}));
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /Load/ }));

    const [title, body, options] = vi.mocked(useModal().confirm).mock.calls[0];
    expect(title).toBe('Load the demo preset HPC and AI platform?');
    expect(options).toMatchObject({
      showInput: true,
      inputRequired: true,
      inputPlaceholder: 'hpc_ai_platform',
    });
    renderWithProviders(<div>{body}</div>);
    expect(
      screen.getByText(/Everyone is signed out, you included/),
    ).toBeInTheDocument();
  });

  it('loads nothing when the typed name does not match', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({ input: 'hpc' });
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /Load/ }));

    await waitFor(() => expect(useNotify().showError).toHaveBeenCalled());
    expect(marketplaceDemoPresetsLoad).not.toHaveBeenCalled();
    expect(getDemoReset()).toBeNull();
  });

  it('loads nothing when cancelled', async () => {
    vi.mocked(useModal().confirm).mockRejectedValue(undefined);
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /Load/ }));

    expect(marketplaceDemoPresetsLoad).not.toHaveBeenCalled();
  });

  it('starts a load with cleanup and shows the reset overlay', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({
      input: 'hpc_ai_platform',
    });
    const onStarted = renderButton();

    await userEvent.click(screen.getByRole('button', { name: /Load/ }));

    await waitFor(() =>
      expect(getDemoReset()).toEqual({ preset: 'hpc_ai_platform' }),
    );
    expect(marketplaceDemoPresetsLoad).toHaveBeenCalledWith({
      path: { name: 'hpc_ai_platform' },
      body: { cleanup_first: true },
    });
    expect(onStarted).toHaveBeenCalled();
  });

  it('reports a load that could not start', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue({
      input: 'hpc_ai_platform',
    });
    vi.mocked(marketplaceDemoPresetsLoad).mockRejectedValue({
      status: 409,
      detail: 'Another demo preset is loading.',
    });
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /Load/ }));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalled(),
    );
    expect(getDemoReset()).toBeNull();
  });
});

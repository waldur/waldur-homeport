import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoPresetStatusRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { DemoResetOverlay } from './DemoResetOverlay';
import { reloadPortal, reloadToLogin } from './reload';
import { clearDemoReset, startDemoReset } from './resetState';

vi.mock('./reload', () => ({
  reloadToLogin: vi.fn(),
  reloadPortal: vi.fn(),
}));

const status = (state: string, extra = {}) => ({
  data: {
    loading: state === 'pending' || state === 'running',
    load: {
      uuid: 'load-1',
      preset: 'site_demo',
      state,
      created: '2026-11-11T10:00:00Z',
      started_at: null,
      finished_at: null,
      error_message: '',
      ...extra,
    },
    users: [],
  },
});

describe('DemoResetOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => clearDemoReset());
  });

  it('shows nothing while no reset is known', () => {
    renderWithProviders(<DemoResetOverlay />);
    expect(screen.queryByTestId('demo-reset-overlay')).toBeNull();
    expect(demoPresetStatusRetrieve).not.toHaveBeenCalled();
  });

  it('covers the portal once the API reports a reset', async () => {
    vi.mocked(demoPresetStatusRetrieve).mockResolvedValue(
      status('running') as any,
    );
    renderWithProviders(<DemoResetOverlay />);

    act(() => startDemoReset('site_demo'));

    expect(await screen.findByText('Resetting the demo')).toBeInTheDocument();
    expect(screen.getByText(/site_demo is loading/)).toBeInTheDocument();
    expect(reloadToLogin).not.toHaveBeenCalled();
  });

  it('goes to the sign-in page when the load is done', async () => {
    vi.mocked(demoPresetStatusRetrieve).mockResolvedValue(
      status('done') as any,
    );
    renderWithProviders(<DemoResetOverlay />);

    act(() => startDemoReset('site_demo'));

    await waitFor(() => expect(reloadToLogin).toHaveBeenCalled());
  });

  it('shows the error of a failed load, with a way back', async () => {
    vi.mocked(demoPresetStatusRetrieve).mockResolvedValue(
      status('erred', { error_message: 'Overlay cannot be read' }) as any,
    );
    renderWithProviders(<DemoResetOverlay />);

    act(() => startDemoReset('site_demo'));

    expect(
      await screen.findByText('Overlay cannot be read'),
    ).toBeInTheDocument();
    expect(reloadToLogin).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', { name: /Back to the portal/ }),
    );
    expect(reloadPortal).toHaveBeenCalled();
  });
});

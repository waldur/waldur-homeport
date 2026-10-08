import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BackendHealthStatusIndicator } from './BackendHealthStatusIndicator';

const renderWithStatus = (status: Record<string, string>) => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve(status),
  } as Response);
  renderWithProviders(<BackendHealthStatusIndicator />);
};

describe('BackendHealthStatusIndicator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('names the button with the healthy status', async () => {
    renderWithStatus({ db: 'working', cache: 'working' });
    expect(
      await screen.findByRole('button', {
        name: 'Backend status: all services working',
      }),
    ).toBeInTheDocument();
  });

  it('names the button with the failing status', async () => {
    renderWithStatus({ db: 'working', cache: 'failing' });
    expect(
      await screen.findByRole('button', {
        name: 'Backend status: some services failing',
      }),
    ).toBeInTheDocument();
  });
});

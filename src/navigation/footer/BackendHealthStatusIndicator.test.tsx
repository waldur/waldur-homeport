import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BackendHealthStatusIndicator } from './BackendHealthStatusIndicator';

const renderWithStatus = (status: Record<string, string>) => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve(status),
  } as Response);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BackendHealthStatusIndicator />
    </QueryClientProvider>,
  );
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rancherCatalogsCreate } from 'waldur-js-client';

import { CatalogCreateDialog } from './CatalogCreateDialog';

vi.mock('waldur-js-client');

const fakeCluster = {
  url: 'cluster-url',
  name: 'Test Cluster',
};

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CatalogCreateDialog resolve={{ cluster: fakeCluster as any }} />
    </QueryClientProvider>,
  );
};

describe('CatalogCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderDialog();
    expect(screen.getByText('Create catalog')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    const { container } = renderDialog();

    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();

    await user.type(
      container.querySelector('input[name="name"]'),
      'Test Catalog',
    );
    await user.type(
      container.querySelector('input[name="catalog_url"]'),
      'https://example.com',
    );
    await user.type(container.querySelector('input[name="branch"]'), 'master');

    expect(submitBtn).not.toBeDisabled();
  });

  it('submits form correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(rancherCatalogsCreate).mockResolvedValue({
      data: { uuid: 'catalog-uuid' },
    } as any);
    const { container } = renderDialog();

    await user.type(
      container.querySelector('input[name="name"]'),
      'Test Catalog',
    );
    await user.type(
      container.querySelector('input[name="catalog_url"]'),
      'https://example.com',
    );
    await user.type(container.querySelector('input[name="branch"]'), 'master');
    await user.type(container.querySelector('input[name="username"]'), 'user');
    await user.type(container.querySelector('input[name="password"]'), 'pass');

    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    await user.click(submitBtn);

    await waitFor(() => {
      expect(rancherCatalogsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            scope: 'cluster-url',
            name: 'Test Catalog',
            catalog_url: 'https://example.com',
            branch: 'master',
            username: 'user',
            password: 'pass',
          }),
        }),
      );
    });
  });
});

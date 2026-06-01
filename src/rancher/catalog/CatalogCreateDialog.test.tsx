import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rancherCatalogsCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CatalogCreateDialog } from './CatalogCreateDialog';

const fakeCluster = {
  url: 'cluster-url',
  name: 'Test Cluster',
};

const renderDialog = () => {
  return renderWithProviders(
    <CatalogCreateDialog resolve={{ cluster: fakeCluster as any }} />,
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
    renderDialog();

    const submitBtn = screen.getByRole('button', { name: /Submit/ });
    expect(submitBtn).toBeDisabled();

    await user.type(screen.getByLabelText(/Name/), 'Test Catalog');
    await user.type(
      screen.getByLabelText(/Catalog URL/),
      'https://example.com',
    );
    await user.type(screen.getByLabelText(/Branch/), 'master');

    expect(submitBtn).not.toBeDisabled();
  });

  it('submits form correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(rancherCatalogsCreate).mockResolvedValue({
      data: { uuid: 'catalog-uuid' },
    } as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'Test Catalog');
    await user.type(
      screen.getByLabelText(/Catalog URL/),
      'https://example.com',
    );
    await user.type(screen.getByLabelText(/Branch/), 'master');
    await user.type(screen.getByLabelText(/Username/), 'user');
    await user.type(screen.getByLabelText(/Password/), 'pass');

    const submitBtn = screen.getByRole('button', { name: /Submit/ });
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

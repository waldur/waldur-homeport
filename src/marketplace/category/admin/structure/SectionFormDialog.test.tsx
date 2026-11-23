import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceSectionsCreate,
  marketplaceSectionsPartialUpdate,
} from 'waldur-js-client';

import { Category } from '@/marketplace/types';
import { renderWithProviders } from '@/test/harness';

import { SectionFormDialog } from './SectionFormDialog';

const category = {
  uuid: 'cat-uuid',
  url: 'https://example.com/api/marketplace-categories/cat-uuid/',
  title: 'HPC',
} as Category;

describe('SectionFormDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceSectionsCreate).mockResolvedValue({} as any);
    vi.mocked(marketplaceSectionsPartialUpdate).mockResolvedValue({} as any);
  });

  it('creates a section and leaves the key to the server', async () => {
    const refetch = vi.fn();
    renderWithProviders(<SectionFormDialog resolve={{ category, refetch }} />);

    await user.type(await screen.findByLabelText(/Title/), 'Support');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() =>
      expect(marketplaceSectionsCreate).toHaveBeenCalledWith({
        body: {
          title: 'Support',
          is_standalone: false,
          category: category.url,
        },
      }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('renames a section by its key', async () => {
    renderWithProviders(
      <SectionFormDialog
        resolve={{
          category,
          section: { key: 'hpc_support', title: 'Support' },
          refetch: vi.fn(),
        }}
      />,
    );

    const title = await screen.findByLabelText(/Title/);
    await user.clear(title);
    await user.type(title, 'Helpdesk');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplaceSectionsPartialUpdate).toHaveBeenCalledWith({
        path: { key: 'hpc_support' },
        body: { title: 'Helpdesk', is_standalone: false },
      }),
    );
  });
});

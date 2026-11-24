import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingTemplatesPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OfferingTemplatePublishToggle } from './OfferingTemplatePublishToggle';

const row = { uuid: 'template-uuid', name: 'SLURM', is_published: false };

describe('OfferingTemplatePublishToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes the template and refreshes the list', async () => {
    vi.mocked(marketplaceOfferingTemplatesPartialUpdate).mockResolvedValue({
      data: { ...row, is_published: true },
    } as any);
    const refetch = vi.fn();
    renderWithProviders(
      <OfferingTemplatePublishToggle row={row as any} refetch={refetch} />,
    );

    const toggle = screen.getByRole('checkbox', { name: 'Published' });
    expect(toggle).not.toBeChecked();
    await userEvent.setup().click(toggle);

    await waitFor(() =>
      expect(marketplaceOfferingTemplatesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'template-uuid' },
        body: { is_published: true },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('unpublishes a published template', async () => {
    vi.mocked(marketplaceOfferingTemplatesPartialUpdate).mockResolvedValue({
      data: row,
    } as any);
    renderWithProviders(
      <OfferingTemplatePublishToggle
        row={{ ...row, is_published: true } as any}
        refetch={vi.fn()}
      />,
    );

    await userEvent
      .setup()
      .click(screen.getByRole('checkbox', { name: 'Published' }));

    await waitFor(() =>
      expect(marketplaceOfferingTemplatesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'template-uuid' },
        body: { is_published: false },
      }),
    );
  });
});

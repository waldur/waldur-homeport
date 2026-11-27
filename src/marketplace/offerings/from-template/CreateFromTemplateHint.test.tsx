import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingTemplatesCount } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { CreateFromTemplateHint } from './CreateFromTemplateHint';

const countResponse = (n: string) =>
  ({ response: { headers: { get: () => n } } }) as any;

describe('CreateFromTemplateHint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('offers the template wizard when a template is published', async () => {
    vi.mocked(marketplaceOfferingTemplatesCount).mockResolvedValue(
      countResponse('2'),
    );
    const user = userEvent.setup();
    renderWithProviders(<CreateFromTemplateHint showProvider />);
    await user.click(await screen.findByTestId('create-from-template'));
    const { closeDialog, openDialog } = useModal();
    expect(closeDialog).toHaveBeenCalled();
    expect(openDialog).toHaveBeenCalledWith(expect.anything(), {
      resolve: { fetch: undefined, showProvider: true },
      size: 'lg',
    });
    expect(marketplaceOfferingTemplatesCount).toHaveBeenCalledWith({
      query: { is_published: true, offering_type: 'Marketplace.SiteAgent' },
    });
  });

  it('says nothing when no template is published', async () => {
    vi.mocked(marketplaceOfferingTemplatesCount).mockResolvedValue(
      countResponse('0'),
    );
    renderWithProviders(<CreateFromTemplateHint />);
    await waitFor(() =>
      expect(marketplaceOfferingTemplatesCount).toHaveBeenCalled(),
    );
    expect(
      screen.queryByTestId('create-from-template'),
    ).not.toBeInTheDocument();
  });
});

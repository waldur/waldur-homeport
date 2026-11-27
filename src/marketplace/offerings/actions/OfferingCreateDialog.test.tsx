import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersList } from 'waldur-js-client';

import { getCategories } from '@/marketplace/common/api';
import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel } from '@/test/select';

import { OfferingCreateDialog } from './OfferingCreateDialog';

vi.mock('@/marketplace/common/api', () => ({
  getCategories: vi.fn(),
}));

vi.mock('@/marketplace/common/registry', () => ({
  getCreatableOfferings: () => [],
}));

vi.mock('@/marketplace/offerings/from-template/CreateFromTemplateHint', () => ({
  CreateFromTemplateHint: () => null,
}));

const provider = {
  uuid: 'provider',
  name: 'AI Platform Services',
  url: 'https://api/customers/provider/',
};

describe('OfferingCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCategories).mockResolvedValue([] as any);
  });

  it('offers only the providers it is given, without a search', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <OfferingCreateDialog
        resolve={{ fetch: vi.fn(), showProvider: true, providers: [provider] }}
      />,
    );
    await screen.findByText('Service provider');
    const select = getSelectByLabel('Service provider');
    await user.click(within(select).getByRole('combobox'));
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'AI Platform Services',
    ]);
    expect(customersList).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersPartialUpdate } from 'waldur-js-client';

import { hasPermission } from '@/permissions/hasPermission';
import { renderWithProviders } from '@/test/harness';
import { useCustomer, useUser } from '@/workspace/hooks';

import { CustomerManage } from './CustomerManage';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

// Capture the internal `update` callback that CustomerManage hands down to its
// tab components, so we can drive it directly and inspect the PATCH body.
let capturedCallback: (formData: any) => Promise<any>;
const TabComponent = ({ callback }: any) => {
  capturedCallback = callback;
  return null;
};
const tabSpec = { component: TabComponent };

const getRequestBody = () =>
  vi.mocked(customersPartialUpdate).mock.calls[0][0].body;

const renderManage = () =>
  renderWithProviders(<CustomerManage tabSpec={tabSpec} />);

describe('CustomerManage update callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-uuid' } as any);
    vi.mocked(hasPermission).mockReturnValue(true);
    vi.mocked(customersPartialUpdate).mockResolvedValue({
      data: { uuid: 'customer-uuid' },
    } as any);
  });

  it('persists the country as the plain 2-letter code from the inline select', async () => {
    renderManage();
    // CountrySelectField emits a bare code string (e.g. "LV"), not a
    // { value, label } object. The code must reach the PATCH body verbatim.
    await capturedCallback({ country: 'LV' });

    expect(customersPartialUpdate).toHaveBeenCalledTimes(1);
    expect(getRequestBody()).toMatchObject({ country: 'LV' });
  });

  it('does not inject a country key when editing an unrelated field', async () => {
    renderManage();
    await capturedCallback({ address: 'Alfreda Kalnina iela 1-3' });

    expect(getRequestBody()).toMatchObject({
      address: 'Alfreda Kalnina iela 1-3',
    });
    expect(getRequestBody()).not.toHaveProperty('country');
  });
});

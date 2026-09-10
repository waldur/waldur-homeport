import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customerCreditsList,
  customersRetrieve,
  marketplaceProviderOfferingsList,
  marketplaceServiceProvidersList,
} from 'waldur-js-client';

import store from '@/store/store';
import { mockListResponse } from '@/test/utils';
import { SET_CURRENT_CUSTOMER } from '@/workspace/constants';

import { fetchProvider, fetchProviderCustomer } from './resolve';

const CUSTOMER_UUID = 'c1';

const provider = {
  url: '/api/marketplace-service-providers/p1/',
  uuid: 'p1',
  customer: `/api/customers/${CUSTOMER_UUID}/`,
  customer_uuid: CUSTOMER_UUID,
  customer_name: 'Big Provider',
  customer_abbreviation: 'BP',
  customer_image: null,
  customer_country: 'EE',
  organization_groups: [],
};

// Mirrors `marketplace-provider`: the state resolves `fetchProviderCustomer`
// under the `fetchCustomer` token and `fetchProvider` under `provider`, and the
// fallback reaches the latter through the injector. Delegating to the real
// `fetchProvider` keeps the API-level mocks below in charge of the outcome.
const transition: any = {
  params: () => ({ uuid: CUSTOMER_UUID }),
  injector: () => ({
    getAsync: (token: string) =>
      token === 'provider'
        ? fetchProvider(transition)
        : Promise.resolve(undefined),
  }),
};

const notFound = { status: 404, detail: 'Not found.' };

describe('fetchProviderCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(store, 'dispatch').mockImplementation((action) => action as any);
    vi.mocked(customerCreditsList).mockResolvedValue(mockListResponse([]));
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([]),
    );
    vi.mocked(marketplaceServiceProvidersList).mockResolvedValue(
      mockListResponse([provider]),
    );
  });

  const dispatchedCustomer = () =>
    vi
      .mocked(store.dispatch)
      .mock.calls.map(([action]: any[]) => action)
      .find((action: any) => action?.type === SET_CURRENT_CUSTOMER)?.payload
      ?.customer;

  it('uses the customer record when it is readable', async () => {
    vi.mocked(customersRetrieve).mockResolvedValue({
      data: { uuid: CUSTOMER_UUID, name: 'Big Provider Ltd' },
    } as any);

    await fetchProviderCustomer(transition);

    expect(dispatchedCustomer()).toMatchObject({ name: 'Big Provider Ltd' });
    expect(marketplaceServiceProvidersList).not.toHaveBeenCalled();
  });

  it('falls back to the provider record when the customer is out of reach', async () => {
    vi.mocked(customersRetrieve).mockRejectedValue(notFound);

    await fetchProviderCustomer(transition);

    expect(dispatchedCustomer()).toMatchObject({
      uuid: CUSTOMER_UUID,
      name: 'Big Provider',
      is_service_provider: true,
      service_provider_uuid: 'p1',
    });
  });

  it('rejects when there is no provider record to stand in', async () => {
    vi.mocked(customersRetrieve).mockRejectedValue(notFound);
    vi.mocked(marketplaceServiceProvidersList).mockResolvedValue(
      mockListResponse([]),
    );

    await expect(fetchProviderCustomer(transition)).rejects.toBe(notFound);
    expect(dispatchedCustomer()).toBeUndefined();
  });

  it('rejects a server error instead of showing a partial organization', async () => {
    const serverError = { status: 500, detail: 'Server error.' };
    vi.mocked(customersRetrieve).mockRejectedValue(serverError);

    await expect(fetchProviderCustomer(transition)).rejects.toBe(serverError);
    expect(marketplaceServiceProvidersList).not.toHaveBeenCalled();
  });
});

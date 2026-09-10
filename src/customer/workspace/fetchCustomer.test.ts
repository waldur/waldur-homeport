import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customerCreditsList,
  customersRetrieve,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import store from '@/store/store';
import { mockListResponse } from '@/test/utils';
import { SET_CURRENT_CUSTOMER } from '@/workspace/constants';

import { fetchCustomer } from './fetchCustomer';

const CUSTOMER_UUID = 'c1';

const transition: any = { params: () => ({ uuid: CUSTOMER_UUID }) };
const withoutUuid: any = { params: () => ({}) };

describe('fetchCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(store, 'dispatch').mockImplementation((action) => action as any);
    vi.mocked(customerCreditsList).mockResolvedValue(mockListResponse([]));
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([]),
    );
  });

  const dispatchedCustomer = () =>
    vi
      .mocked(store.dispatch)
      .mock.calls.map(([action]: any[]) => action)
      .find((action: any) => action?.type === SET_CURRENT_CUSTOMER)?.payload
      ?.customer;

  it('dispatches the customer with its credit and offering flag', async () => {
    vi.mocked(customersRetrieve).mockResolvedValue({
      data: { uuid: CUSTOMER_UUID, name: 'Big Provider Ltd' },
    } as any);
    vi.mocked(customerCreditsList).mockResolvedValue(
      mockListResponse([{ uuid: 'credit-1' }]),
    );
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'offering-1' }], 1),
    );

    await fetchCustomer(transition);

    expect(dispatchedCustomer()).toMatchObject({
      name: 'Big Provider Ltd',
      credit: { uuid: 'credit-1' },
      has_my_offerings: true,
    });
  });

  // `organization` and `provider-helpdesk` resolve through this function with no
  // stand-in. They used to call goToNotFound() and complete, which left the
  // workspace on the same URL with nothing in it; now the rejection reaches the
  // router's onError hook, which picks an error page from the status.
  it.each([403, 404, 500])(
    'rejects with the original error on %i when no fallback is offered',
    async (status) => {
      const error = { status, detail: 'Denied.' };
      vi.mocked(customersRetrieve).mockRejectedValue(error);

      await expect(fetchCustomer(transition)).rejects.toBe(error);
      expect(dispatchedCustomer()).toBeUndefined();
    },
  );

  it('rejects when the organization UUID is missing', async () => {
    await expect(fetchCustomer(withoutUuid)).rejects.toThrow(
      'Organization UUID is missing.',
    );
    expect(customersRetrieve).not.toHaveBeenCalled();
  });

  it('keeps the original error when the fallback itself fails', async () => {
    const notFound = { status: 404, detail: 'Not found.' };
    vi.mocked(customersRetrieve).mockRejectedValue(notFound);

    await expect(
      fetchCustomer(transition, () => Promise.reject({ status: 500 })),
    ).rejects.toBe(notFound);
  });

  it('keeps the original error when the fallback finds nothing', async () => {
    const notFound = { status: 404, detail: 'Not found.' };
    vi.mocked(customersRetrieve).mockRejectedValue(notFound);

    await expect(
      fetchCustomer(transition, () => Promise.resolve(undefined)),
    ).rejects.toBe(notFound);
  });
});

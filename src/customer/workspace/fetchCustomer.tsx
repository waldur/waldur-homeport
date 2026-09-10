import { Transition } from '@uirouter/react';
import { cloneDeep } from 'lodash-es';
import { useEffect, useState } from 'react';
import {
  customerCreditsList,
  marketplaceProviderOfferingsList,
  projectsList,
} from 'waldur-js-client';

import { fetchResultCount, getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import store from '@/store/store';
import { setCurrentCustomer } from '@/workspace/actions';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { getCustomer } from '../utils';

/**
 * `getFallbackCustomer` stands in when the role may not read the customer — see
 * `fetchProviderCustomer` in `src/marketplace/resolve.ts`.
 *
 * Rejecting hands the failure to the router's onError hook. Redirecting from
 * here instead raced the in-flight transition, which completed with no customer
 * and rendered every page under the workspace blank, with no error.
 */
export async function fetchCustomer(
  transition: Transition,
  getFallbackCustomer?: () => Promise<Customer | undefined>,
) {
  const customerId = transition.params()?.uuid;
  if (!customerId) {
    throw new Error('Organization UUID is missing.');
  }
  const currentCustomer = await getCustomer(customerId).catch(async (error) => {
    // Only a permission answer is worth standing in for; a 500 or a dropped
    // connection must surface rather than quietly show a partial organization.
    if (![403, 404].includes(error?.status)) {
      throw error;
    }
    // A stand-in that fails must not replace the answer it stood in for: the
    // router picks the error page from `error.detail.status`, so rejecting
    // with the fallback's own failure would send a 404 to the 500 page.
    const fallback = await getFallbackCustomer?.().catch(() => undefined);
    if (!fallback) {
      throw error;
    }
    return fallback;
  });
  const [credit, myOfferingsResult] = await Promise.all([
    customerCreditsList({
      query: { customer_uuid: currentCustomer?.uuid },
    }).then((r) => r.data[0]),
    marketplaceProviderOfferingsList({
      query: {
        customer_uuid: currentCustomer?.uuid,
        billable: false,
        page_size: 1,
      },
    }),
  ]);
  Object.assign(currentCustomer, {
    credit,
    has_my_offerings: fetchResultCount(myOfferingsResult) > 0,
  });
  store.dispatch(setCurrentCustomer(currentCustomer));
}

export function fetchCustomerProjects(customerUuid) {
  return getAllPages((page) =>
    projectsList({
      query: {
        customer: [customerUuid],
        field: ['uuid', 'url', 'name', 'end_date', 'image', 'resources_count'],
        o: ['name'],
        page,
        page_size: MAX_PAGE_SIZE,
      },
    }),
  );
}

/** Get customer's project permissions for the selected customer separately */
export const useCustomerProjects = () => {
  const { showErrorResponse } = useNotify();
  const customer = useCustomer();
  const setCurrentCustomer = useSetCustomer();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!customer || customer.projects) return;
    setLoading(true);
    fetchCustomerProjects(customer.uuid)
      .then((projects) => {
        const updatedCustomer = cloneDeep(customer);
        Object.assign(updatedCustomer, { projects });
        setCurrentCustomer(updatedCustomer);
      })
      .catch((err) => {
        showErrorResponse(err, translate('Unable to load projects'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customer]);

  return { loading };
};

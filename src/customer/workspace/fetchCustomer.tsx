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
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import store from '@/store/store';
import { setCurrentCustomer } from '@/workspace/actions';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';

import { getCustomer } from '../utils';

export async function fetchCustomer(transition: Transition) {
  const customerId = transition.params()?.uuid;
  if (!customerId) {
    router.stateService.go('errorPage.notFound');
  } else {
    try {
      const currentCustomer = await getCustomer(customerId);
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
    } catch {
      router.stateService.go('errorPage.notFound');
    }
  }
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

import { Transition } from '@uirouter/react';
import { cloneDeep } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { customerCreditsList, projectsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { showErrorResponse } from '@waldur/store/notify';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';

import { getCustomer } from '../utils';

export async function fetchCustomer(transition: Transition) {
  const customerId = transition.params()?.uuid;
  if (!customerId) {
    router.stateService.go('errorPage.notFound');
  } else {
    try {
      const currentCustomer = await getCustomer(customerId);
      const credit = await customerCreditsList({
        query: { customer_uuid: currentCustomer?.uuid },
      }).then((r) => r.data[0]);
      Object.assign(currentCustomer, { credit });
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
export function useCustomerProjects() {
  const customer = useSelector(getCustomerSelector);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!customer || customer.projects) return;
    setLoading(true);
    fetchCustomerProjects(customer.uuid)
      .then((projects) => {
        const updatedCustomer = cloneDeep(customer);
        Object.assign(updatedCustomer, { projects });
        store.dispatch(setCurrentCustomer(updatedCustomer));
      })
      .catch((err) => {
        store.dispatch(
          showErrorResponse(err, translate('Unable to load projects')),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customer]);

  return { loading };
}

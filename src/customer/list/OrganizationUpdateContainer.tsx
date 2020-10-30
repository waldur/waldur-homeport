import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { CustomerLogoUpdateContainer } from '@waldur/customer/details/CustomerLogoUpdateContainer';
import { OrganizationUpdate } from '@waldur/customer/list/OrganizationUpdate';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/marketplace/common/api';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';

const getBreadcrumbs = (): BreadcrumbItem[] => [
  {
    label: translate('Support dashboard'),
    state: 'support.helpdesk',
  },
  {
    label: translate('Organizations'),
    state: 'support.customers',
  },
];

export const OrganizationUpdateContainer = () => {
  const {
    params: { customer_uuid },
  } = useCurrentStateAndParams();
  const { loading, error, value: customer } = useAsync(
    async () => await getCustomer(customer_uuid),
    [],
  );

  useBreadcrumbsFn(getBreadcrumbs, []);

  useTitle(
    customer
      ? translate('Organization update ({name})', {
          name: customer.name,
        })
      : translate('Organization update'),
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load customer.')}</>
  ) : (
    <>
      <OrganizationUpdate customer={customer} />
      <CustomerLogoUpdateContainer customer={customer} />
    </>
  );
};

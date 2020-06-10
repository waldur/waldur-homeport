import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { Layout } from '@waldur/navigation/Layout';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerSidebar } from './CustomerSidebar';

function getBreadcrumbs(customer): BreadcrumbItem[] {
  if (customer) {
    return [
      {
        label: translate('Organization workspace'),
        state: 'organization.dashboard',
        params: {
          uuid: customer.uuid,
        },
      },
    ];
  }
}

export const CustomerWorkspace = () => {
  const [pageClass, setPageClass] = React.useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState<boolean>();
  const customer = useSelector(getCustomer);
  const { state, params } = useCurrentStateAndParams();

  function refreshState() {
    const data = state?.data;
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
  }

  useBreadcrumbsFn(() => getBreadcrumbs(customer), [customer]);

  React.useEffect(refreshState, [state, params]);

  return (
    <Layout
      sidebar={<CustomerSidebar />}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};

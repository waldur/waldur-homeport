import * as React from 'react';
import { useSelector } from 'react-redux';
import useEffectOnce from 'react-use/esm/useEffectOnce';

import { $state, ngInjector, $rootScope } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Layout } from '@waldur/navigation/Layout';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerSidebar } from './CustomerSidebar';

function refreshBreadcrumbs(currentCustomer, pageTitle) {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.activeItem = pageTitle;
  if (currentCustomer) {
    BreadcrumbsService.items = [
      {
        label: translate('Organization workspace'),
        state: 'organization.dashboard',
        params: {
          uuid: currentCustomer.uuid,
        },
      },
    ];
  }
}

export const CustomerWorkspace = () => {
  const [pageTitle, setPageTitle] = React.useState();
  const [pageClass, setPageClass] = React.useState();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState();
  const customer = useSelector(getCustomer);

  function refreshState() {
    const data = $state.current?.data;
    setPageTitle(data?.pageTitle);
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
    refreshBreadcrumbs(customer, data?.pageTitle);
  }

  useEffectOnce(() => {
    refreshState();
    return $rootScope.$on('$stateChangeSuccess', refreshState);
  });

  return (
    <Layout
      sidebar={<CustomerSidebar />}
      pageTitle={pageTitle}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};

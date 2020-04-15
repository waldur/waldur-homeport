import * as React from 'react';
import { useSelector } from 'react-redux';

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
  const [pageTitle, setPageTitle] = React.useState<string>();
  const [pageClass, setPageClass] = React.useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState<boolean>();
  const customer = useSelector(getCustomer);

  function refreshState() {
    const data = $state.current?.data;
    setPageTitle(translate(data?.pageTitle));
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
    refreshBreadcrumbs(customer, translate(data?.pageTitle));
  }

  React.useEffect(() => {
    refreshState();
    return $rootScope.$on('$stateChangeSuccess', refreshState);
  }, []);

  return (
    <Layout
      sidebar={<CustomerSidebar />}
      pageTitle={pageTitle}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};

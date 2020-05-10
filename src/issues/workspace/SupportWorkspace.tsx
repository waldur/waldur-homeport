import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Layout } from '@waldur/navigation/Layout';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';

import { SupportSidebar } from './SupportSidebar';

function refreshBreadcrumbs(pageTitle) {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const IssueNavigationService = ngInjector.get('IssueNavigationService');
  BreadcrumbsService.activeItem = translate(pageTitle);
  BreadcrumbsService.items = [
    {
      label: translate('Support dashboard'),
      onClick: () => IssueNavigationService.gotoDashboard(),
    },
  ];
}

export const SupportWorkspace = () => {
  const [pageTitle, setPageTitle] = React.useState<string>();
  const [pageClass, setPageClass] = React.useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState<boolean>();
  const { state, params } = useCurrentStateAndParams();

  function refreshState() {
    const data = state?.data;
    setPageTitle(data?.pageTitle);
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
    refreshBreadcrumbs(data?.pageTitle);
  }

  React.useEffect(() => {
    ngInjector.get('WorkspaceService').setWorkspace({
      hasCustomer: true,
      workspace: WOKSPACE_NAMES.support,
    });
  }, []);

  React.useEffect(refreshState, [state, params]);

  return (
    <Layout
      sidebar={<SupportSidebar />}
      pageTitle={pageTitle}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};

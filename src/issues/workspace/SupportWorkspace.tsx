import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { Layout } from '@waldur/navigation/Layout';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';

import { SupportSidebar } from './SupportSidebar';

function getBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: translate('Support dashboard'),
      action: () => ngInjector.get('IssueNavigationService').gotoDashboard(),
    },
  ];
}

export const SupportWorkspace = () => {
  const [pageClass, setPageClass] = React.useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState<boolean>();
  const { state, params } = useCurrentStateAndParams();

  function refreshState() {
    const data = state?.data;
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
  }

  useBreadcrumbsFn(getBreadcrumbs, []);

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
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};

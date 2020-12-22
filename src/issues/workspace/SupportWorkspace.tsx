import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, useState, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  setBreadcrumbs,
  useBreadcrumbsFn,
} from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { Layout } from '@waldur/navigation/Layout';
import { setCurrentWorkspace } from '@waldur/workspace/actions';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { IssueNavigationService } from './IssueNavigationService';
import { SupportSidebar } from './SupportSidebar';

function getBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: translate('Support dashboard'),
      action: () => IssueNavigationService.gotoDashboard(),
    },
  ];
}

export function useReportingBreadcrumbs() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        ...getBreadcrumbs(),
        {
          label: translate('Reporting'),
        },
      ]),
    );
    return () => {
      dispatch(setBreadcrumbs(getBreadcrumbs()));
    };
  });
}

export const SupportWorkspace: FunctionComponent = () => {
  const [pageClass, setPageClass] = useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = useState<boolean>();
  const { state, params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  function refreshState() {
    const data = state?.data;
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
  }

  useBreadcrumbsFn(getBreadcrumbs, []);

  useEffect(() => {
    dispatch(setCurrentWorkspace(SUPPORT_WORKSPACE));
  }, [dispatch]);

  useEffect(refreshState, [state, params]);

  return (
    <Layout
      sidebar={<SupportSidebar />}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};

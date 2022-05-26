import { useEffect, useMemo, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import {
  getReportingItems,
  IssueNavigationService,
} from '@waldur/issues/workspace/IssueNavigationService';
import {
  setBreadcrumbs,
  useBreadcrumbsFn,
} from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTabs } from '@waldur/navigation/context';
import { Layout } from '@waldur/navigation/Layout';
import { setCurrentWorkspace } from '@waldur/workspace/actions';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

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
  const tabs = useMemo(
    () =>
      getReportingItems()
        .filter((item) => !item.feature || isFeatureVisible(item.feature))
        .map((item) => ({
          title: item.label,
          to: item.state,
        })),
    [],
  );
  useTabs(tabs);

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
  const dispatch = useDispatch();

  useBreadcrumbsFn(getBreadcrumbs, []);

  useEffect(() => {
    dispatch(setCurrentWorkspace(SUPPORT_WORKSPACE));
  }, [dispatch]);

  return <Layout />;
};

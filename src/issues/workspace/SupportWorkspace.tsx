import { UIView } from '@uirouter/react';
import { useMemo } from 'react';

import { isFeatureVisible } from '@waldur/features/connect';
import { getReportingItems } from '@waldur/issues/workspace/IssueNavigationService';
import { useTabs } from '@waldur/navigation/context';
import { useSupportItems } from '@waldur/navigation/navitems';

export function useReportingTabs() {
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
}

export const SupportContainer = () => {
  useSupportItems();
  return <UIView />;
};

import { isStateVisible } from '@/core/stateVisibility';
import { isFeatureVisible } from '@/features/connect';
import { translate } from '@/i18n';

import { getCategoryConfig, getVisibleReports } from './constants';

export interface ReportingTab {
  title: string;
  state: string;
}

/**
 * Tabs of the reporting section.
 *
 * A category tab is shown only when its target state is actually reachable.
 * A category's flag and the flag on its route need not be the same flag, so
 * checking the category flag alone could render a tab that answers with the
 * feature-disabled page on click. `isStateVisible` reads the gate off the
 * route itself, which is what the transition hook enforces, so the two cannot
 * drift apart.
 *
 * The report list is filtered exactly as the category page filters it, so a
 * tab never leads to a page with no reports on it either.
 */
export const getReportingTabs = (workspace): ReportingTab[] => {
  const categories = getCategoryConfig();
  const staff = Boolean(workspace?.user?.is_staff);
  const tabs: ReportingTab[] = [
    { title: translate('Overview'), state: 'reporting-dashboard' },
  ];

  Object.entries(categories).forEach(([key, category]) => {
    const state = `reporting-${key}-list`;
    if (!isStateVisible(state)) {
      return;
    }
    if (category.feature && !isFeatureVisible(category.feature)) {
      return;
    }
    if (category.permission && !category.permission({ workspace } as any)) {
      return;
    }
    if (getVisibleReports(category, staff).length === 0) {
      return;
    }
    tabs.push({ title: category.title, state });
  });

  return tabs;
};

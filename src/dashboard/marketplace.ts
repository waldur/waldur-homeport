import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCategoryUsages } from '@waldur/marketplace/common/api';
import { CategoryComponentUsage } from '@waldur/marketplace/types';
import { WorkspaceType } from '@waldur/workspace/types';

import { Category } from './CategoryResources';
import { getResourceChartOptions } from './chart';
import { Scope } from './types';

interface CollectedData {
  [uuid: string]: {
    title: string;
    components: {
      [type: string]: {
        name: string;
        measured_unit: string;
        reported_usage: {
          [date: string]: number;
        };
        fixed_usage: {
          [date: string]: number;
        };
      };
    };
  };
}

interface FilteredData {
  uuid: string;
  title: string;
  components: Array<{
    name: string;
    measured_unit: string;
    reportedUsage: Array<{
      date: string;
      value: number;
    }>;
    fixedUsage: Array<{
      date: string;
      value: number;
    }>;
  }>;
}

const collectData = (rows: CategoryComponentUsage[]): CollectedData => {
  const collector: CollectedData = {};
  for (const row of rows) {
    if (!collector[row.category_uuid]) {
      collector[row.category_uuid] = {
        title: row.category_title,
        components: {},
      };
    }
    const category = collector[row.category_uuid];
    if (!category.components[row.type]) {
      category.components[row.type] = {
        name: row.name,
        measured_unit: row.measured_unit,
        reported_usage: {},
        fixed_usage: {},
      };
    }
    const components = category.components[row.type];
    components.reported_usage[row.date] = row.reported_usage;
    components.fixed_usage[row.date] = row.fixed_usage;
  }
  return collector;
};

const filterData = (collector: CollectedData): FilteredData[] => {
  return Object.keys(collector).map(categoryUuid => {
    const category = collector[categoryUuid];
    const components = Object.keys(category.components).map(type => {
      const component = category.components[type];
      const reportedUsage = Object.keys(component.reported_usage).map(date => ({
        date,
        value: component.reported_usage[date],
      }));
      const fixedUsage = Object.keys(component.fixed_usage).map(date => ({
        date,
        value: component.fixed_usage[date],
      }));
      return {
        name: component.name,
        measured_unit: component.measured_unit,
        reportedUsage,
        fixedUsage,
      };
    });
    return {
      uuid: categoryUuid,
      title: category.title,
      components,
    };
  });
};

const formatMetrics = (
  category: FilteredData,
  variant: 'reportedUsage' | 'fixedUsage',
): string[] => {
  return category.components
    .filter(component => component[variant].filter(row => row.value).length > 0)
    .map(
      component =>
        `${component.name} (${
          variant === 'reportedUsage' ? 'usage' : 'fixed'
        })`,
    );
};

const formatChart = (
  category: FilteredData,
  variant: 'reportedUsage' | 'fixedUsage',
): object[] => {
  return category.components
    .filter(component => component[variant].filter(row => row.value).length > 0)
    .map(component => {
      const sorted = component[variant].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const dates = sorted.map(row => row.date);
      const values = sorted.map(row => row.value);
      return getResourceChartOptions(
        dates,
        values,
        null,
        component.measured_unit,
      );
    });
};

const formatData = (
  list: FilteredData[],
  workspace: WorkspaceType,
): Category[] => {
  return list
    .map(category => {
      return {
        title: category.title,
        metrics: [
          ...formatMetrics(category, 'reportedUsage'),
          ...formatMetrics(category, 'fixedUsage'),
        ],
        charts: [
          ...formatChart(category, 'reportedUsage'),
          ...formatChart(category, 'fixedUsage'),
        ],
        actions: [
          {
            title: translate('Add resource'),
            onClick: () => {
              const state =
                workspace === 'organization'
                  ? 'marketplace-category-customer'
                  : 'marketplace-category';
              $state.go(state, { category_uuid: category.uuid });
            },
          },
        ],
      };
    })
    .filter(category => category.charts.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title));
};

export async function loadMarketplaceCategories(
  workspace: WorkspaceType,
  scope: Scope,
): Promise<Category[]> {
  const params = { scope: scope.url };
  const rows = await getCategoryUsages({ params });
  const collector = collectData(rows);
  const list = filterData(collector);
  return formatData(list, workspace);
}

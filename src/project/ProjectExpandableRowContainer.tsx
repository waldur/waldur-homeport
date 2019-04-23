import * as React from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { getFormatterUnits } from '@waldur/dashboard/api';
import { getDashboardCategories } from '@waldur/dashboard/categories';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { ExpandableRow, ResourceExpandableRow } from '@waldur/resource/ResourceExpandableRow';
import { Quota, Project } from '@waldur/workspace/types';

const parseQuotas = (quotaItems: Quota[]): ExpandableRow[] => {
  const categories = getDashboardCategories('project');
  const quotas = categories.reduce((acc, category) => [...acc, ...category.quotas], []);
  const usages = quotaItems.reduce((map, quota) => ({
    ...map,
    [quota.name]: quota.usage,
  }), {});

  return quotas.filter(quota => usages[quota.quota]).map(quota => {
    const usage = usages[quota.quota] || 0;
    const { formatter, units } = getFormatterUnits(quota.type, usage);
    const current = units ? `${formatter(usage)} ${units}` : formatter(usage);
    return {
      label: quota.title,
      value: current,
    };
  });
};

const parseCounters = (categories: Category[], counters: object): ExpandableRow[] => {
  return categories.map(category => ({
    label: category.title,
    value: counters[`marketplace_category_${category.uuid}`],
  })).filter(row => row.value);
};

const getProjectCounters = (projectId: string) =>
  get(`/projects/${projectId}/counters/`).then(response => response.data);

const combineRows = (rows: ExpandableRow[]): ExpandableRow[] =>
  rows.filter(item => item.value).sort((a, b) => a.label.localeCompare(b.label));

async function loadData(props): Promise<ExpandableRow[]> {
  const quotaRows = isFeatureVisible('resources.legacy') ? parseQuotas(props.quotas) : [];
  if (!isFeatureVisible('marketplace')) {
    return combineRows(quotaRows);
  }
  const categories = await getCategories({params: {field: ['uuid', 'title']}});
  const counters = await getProjectCounters(props.uuid);
  const counterRows = parseCounters(categories, counters);
  return combineRows([...quotaRows, ...counterRows]);
}

export const ProjectExpandableRowContainer: React.SFC<{row: Project}> = props => (
  <Query loader={loadData} variables={props.row}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner/>;
      } else if (error) {
        return <span>{translate('Unable to load project resources.')}</span>;
      } else {
        return <ResourceExpandableRow rows={data}/>;
      }
    }}
  </Query>
);

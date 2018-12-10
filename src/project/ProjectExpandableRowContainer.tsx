import * as React from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { makeCancelable } from '@waldur/core/makeCancelable';
import { PROJECT_DASHBOARD } from '@waldur/dashboard/constants';
import { getDashboardQuotas } from '@waldur/dashboard/registry';
import { isFeatureVisible } from '@waldur/features/connect';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { Quota, Project } from '@waldur/workspace/types';

import { ExpandableRow, ProjectExpandableRow } from './ProjectExpandableRow';

const parseQuotas = (quotaItems: Quota[]): ExpandableRow[] => {
  const quotas = getDashboardQuotas(PROJECT_DASHBOARD);
  const usages = quotaItems.reduce((map, quota) => ({
    ...map,
    [quota.name]: quota.usage,
  }), {});
  return quotas.map(quota => ({
    label: quota.title,
    value: usages[quota.quota] || 0,
  }));
};

const parseCounters = (categories: Category[], counters: object): ExpandableRow[] => {
  return categories.map(category => ({
    label: category.title,
    value: counters[`marketplace_category_${category.uuid}`],
  }));
};

const getProjectCounters = (projectId: string) =>
  get(`/projects/${projectId}/counters/`).then(response => response.data);

const combineRows = (rows: ExpandableRow[]): ExpandableRow[] =>
  rows.filter(item => item.value).sort((a, b) => a.label.localeCompare(b.label));

async function loadData(uuid: string, quotas: Quota[]): Promise<ExpandableRow[]> {
  const quotaRows = parseQuotas(quotas);
  if (!isFeatureVisible('marketplace')) {
    return combineRows(quotaRows);
  }
  const categories = await getCategories({params: {field: ['uuid', 'title']}});
  const counters = await getProjectCounters(uuid);
  const counterRows = parseCounters(categories, counters);
  return combineRows([...quotaRows, ...counterRows]);
}

export class ProjectExpandableRowContainer extends React.Component<{row: Project}> {
  state = {
    rows: undefined,
  };

  cancel?(): void;

  componentDidMount() {
    const { cancel, promise } = makeCancelable(loadData(this.props.row.uuid, this.props.row.quotas));
    promise.then(rows => {
      this.setState({ rows });
    });
    this.cancel = cancel;
  }

  componentWillUnmount() {
    if (this.cancel) {
      this.cancel();
    }
  }

  render() {
    if (this.state.rows === undefined) {
      return <LoadingSpinner/>;
    }

    return (
      <ProjectExpandableRow rows={this.state.rows}/>
    );
  }
}

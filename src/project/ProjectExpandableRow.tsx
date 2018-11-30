import * as React from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { PROJECT_DASHBOARD } from '@waldur/dashboard/constants';
import { getDashboardQuotas } from '@waldur/dashboard/registry';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Field } from '@waldur/resource/summary';
import { Project } from '@waldur/workspace/types';

const PureProjectExpandableRow = ({ rows }) =>
  rows.length > 0 ? (
    <dl className="dl-horizontal m-t-sm resource-details-table">
      {rows.map((row, index) => (
        <Field
          key={index}
          label={row.label}
          value={row.value}
        />
      ))}
    </dl>
  ) : (
    <p>
      {translate('Project does not have any resources yet.')}
    </p>
  );

const parseQuotas = (project: Project) => {
  const quotas = getDashboardQuotas(PROJECT_DASHBOARD);
  const usages = project.quotas.reduce((map, quota) => ({
    ...map,
    [quota.name]: quota.usage,
  }), {});
  return quotas.map(quota => ({
    label: quota.title,
    value: usages[quota.quota] || 0,
  }));
};

const parseCounters = (categories, counters) => {
  return categories.map(category => ({
    label: category.title,
    value: counters[`marketplace_category_${category.uuid}`],
  }));
};

const getProjectCounters = (projectId: string) =>
  get(`/projects/${projectId}/counters/`).then(response => response.data);

const combineRows = rows =>
  rows.filter(item => item.value).sort((a, b) => a.label.localeCompare(b.label));

export class ProjectExpandableRow extends React.Component<any> {
  state = {
    rows: undefined,
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const counters = await getProjectCounters(this.props.row.uuid);
    const quotaRows = parseQuotas(this.props.row);
    let rows = quotaRows;

    if (isFeatureVisible('marketplace')) {
      const categories = await getCategories({params: {field: ['uuid', 'title']}});
      const counterRows = parseCounters(categories, counters);
      rows = [...rows, ...counterRows];
    }

    rows = combineRows(rows);

    this.setState({ rows });
  }

  render() {
    if (this.state.rows === undefined) {
      return <LoadingSpinner/>;
    }

    return (
      <PureProjectExpandableRow rows={this.state.rows}/>
    );
  }
}

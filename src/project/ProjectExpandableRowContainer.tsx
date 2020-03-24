import * as React from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import {
  ExpandableRow,
  ResourceExpandableRow,
} from '@waldur/resource/ResourceExpandableRow';
import { Project } from '@waldur/workspace/types';

const parseCounters = (
  categories: Category[],
  counters: object,
): ExpandableRow[] => {
  return categories
    .map(category => ({
      label: category.title,
      value: counters[`marketplace_category_${category.uuid}`],
    }))
    .filter(row => row.value);
};

const getProjectCounters = (projectId: string) =>
  get(`/projects/${projectId}/counters/`).then(response => response.data);

const combineRows = (rows: ExpandableRow[]): ExpandableRow[] =>
  rows
    .filter(item => item.value)
    .sort((a, b) => a.label.localeCompare(b.label));

async function loadData(props): Promise<ExpandableRow[]> {
  const categories = await getCategories({
    params: { field: ['uuid', 'title'] },
  });
  const counters = await getProjectCounters(props.uuid);
  const counterRows = parseCounters(categories, counters);
  return combineRows(counterRows);
}

export const ProjectExpandableRowContainer: React.FC<{
  row: Project;
}> = props => (
  <Query loader={loadData} variables={props.row}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner />;
      } else if (error) {
        return <span>{translate('Unable to load project resources.')}</span>;
      } else {
        return <ResourceExpandableRow rows={data} />;
      }
    }}
  </Query>
);

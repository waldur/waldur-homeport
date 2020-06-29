import * as React from 'react';
import Select from 'react-select';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

import { getChecklists, getCustomerStats, getCategories } from './api';
import { StatsTable } from './StatsTable';
import { Checklist } from './types';

const loadData = async () => {
  const categories = await getCategories();
  const checklists = await getChecklists();
  return {
    categories,
    checklists: checklists.reduce(
      (result, checklist) => ({
        ...result,
        [checklist.category_uuid]: [
          ...(result[checklist.category_uuid] || []),
          checklist,
        ],
      }),
      {},
    ),
  };
};

const CategoryPanel = ({ category, checklists, customer }) => {
  const [checklist, setChecklist] = React.useState<Checklist>();
  const statsState = useAsync(
    () =>
      checklist
        ? getCustomerStats(customer.uuid, checklist.uuid)
        : Promise.resolve([]),
    [customer, checklist],
  );

  return (
    <Panel title={category.name}>
      <Select
        labelKey="name"
        valueKey="uuid"
        value={checklist}
        onChange={setChecklist}
        options={checklists}
        clearable={false}
      />
      {statsState.loading ? (
        <LoadingSpinner />
      ) : Array.isArray(statsState.value) && statsState.value.length > 0 ? (
        <StatsTable
          stats={statsState.value}
          scopeTitle={translate('Project')}
        />
      ) : checklist ? (
        translate('There are no matching checklists.')
      ) : null}
    </Panel>
  );
};

export const CustomerChecklistOverview = ({ customer }) => {
  const asyncState = useAsync(loadData, []);

  if (asyncState.loading) {
    return <LoadingSpinner />;
  }

  if (
    asyncState.error ||
    !asyncState.value.categories.length ||
    !Object.keys(asyncState.value.checklists).length
  ) {
    return null;
  }
  return (
    <>
      {asyncState.value.categories.map((category) => (
        <CategoryPanel
          key={category.uuid}
          checklists={asyncState.value.checklists[category.uuid]}
          category={category}
          customer={customer}
        />
      ))}
    </>
  );
};

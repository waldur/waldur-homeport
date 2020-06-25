import * as React from 'react';
import Select from 'react-select';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getChecklists, getCustomerStats } from './api';
import { StatsTable } from './StatsTable';
import { Checklist } from './types';

export const CustomerChecklistOverview = ({ customer }) => {
  const optionsState = useAsync(getChecklists, []);
  const [checklist, setChecklist] = React.useState<Checklist>();
  const statsState = useAsync(
    () =>
      checklist
        ? getCustomerStats(customer.uuid, checklist.uuid)
        : Promise.resolve([]),
    [customer, checklist],
  );

  return (
    <>
      <Select
        isLoading={optionsState.loading}
        labelKey="name"
        valueKey="uuid"
        value={checklist}
        onChange={setChecklist}
        options={optionsState.value}
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
    </>
  );
};

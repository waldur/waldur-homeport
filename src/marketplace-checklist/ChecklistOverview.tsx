import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { CustomerMap } from './CustomerMap';
import { StatsTable } from './StatsTable';
import { useChecklistOverview } from './useChecklist';

export const ChecklistOverview = () => {
  const state = useChecklistOverview($state.params.category);

  if (state.checklistLoading) {
    return <LoadingSpinner />;
  } else if (state.checklistErred) {
    return <>{translate('Unable to load checklists.')}</>;
  } else if (state.checklistOptions) {
    if (!state.checklist) {
      return <>{translate('There are no checklist yet.')}</>;
    }
    return (
      <>
        <Select
          labelKey="name"
          valueKey="uuid"
          value={state.checklist}
          onChange={state.setChecklist}
          options={state.checklistOptions}
          clearable={false}
          wrapperStyle={{ zIndex: 2000 }} /* Because leaflet z-index is 1000 */
        />
        {state.statsLoading ? (
          <LoadingSpinner />
        ) : state.statsErred ? (
          <>{translate('Unable to load compiance overview.')}</>
        ) : (
          <Panel className="m-t-md">
            <CustomerMap customers={state.statsList} />
            <StatsTable stats={state.statsList} />
          </Panel>
        )}
      </>
    );
  } else {
    return null;
  }
};

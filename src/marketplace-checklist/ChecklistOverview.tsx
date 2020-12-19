import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Panel } from 'react-bootstrap';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { CustomerMap } from './CustomerMap';
import { StatsTable } from './StatsTable';
import { useChecklistOverview } from './useChecklist';

export const ChecklistOverview: FunctionComponent = () => {
  useTitle(translate('Compliance'));
  const {
    params: { category },
  } = useCurrentStateAndParams();
  const state = useChecklistOverview(category);

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
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={state.checklist}
          onChange={state.setChecklist}
          options={state.checklistOptions}
          isClearable={false}
          styles={{
            control: (base) => ({
              ...base,
              zIndex: 2000,
            }) /* Because leaflet z-index is 1000 */,
          }}
        />
        {state.statsLoading ? (
          <LoadingSpinner />
        ) : state.statsErred ? (
          <>{translate('Unable to load compliance overview.')}</>
        ) : (
          <Panel className="m-t-md">
            <CustomerMap customers={state.statsList} />
            <StatsTable
              stats={state.statsList}
              scopeTitle={translate('Organization')}
            />
          </Panel>
        )}
      </>
    );
  } else {
    return null;
  }
};

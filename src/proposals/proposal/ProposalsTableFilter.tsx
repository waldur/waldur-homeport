import { Field, reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CallAutocomplete } from '@waldur/proposals/CallAutocomplete';
import { PROPOSALS_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const ProposalsTableFilter = reduxForm({
  form: PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
})((props) => {
  useReinitializeFilterFromUrl(PROPOSALS_FILTER_FORM_ID, props.initialValues);
  return (
    <>
      <TableFilterItem title={translate('State')} name="state">
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={getProposalStateOptions()}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isMulti={true}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Call')}
        name="call"
        badgeValue={(value) => value?.name}
      >
        <CallAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
    </>
  );
});

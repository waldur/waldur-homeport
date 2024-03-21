import { Field, reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CallAutocomplete } from '@waldur/proposals/CallAutocomplete';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

const PureProposalsTableFilter = ({ form }) => {
  useReinitializeFilterFromUrl(form);
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
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Call')}
        name="call"
        badgeValue={(value) => value?.name}
      >
        <CallAutocomplete />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: USER_PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
});

export const ProposalsTableFilter = enhance(PureProposalsTableFilter);

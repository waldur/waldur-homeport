import { FunctionComponent } from 'react';
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

const SharedProposalsTableFilter: FunctionComponent = () => {
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

const UserProposalsTableFilter: FunctionComponent = () => {
  const NON_CANCELED_REJECTED_STATES = getProposalStateOptions().filter(
    (option) => option.value !== 'canceled' && option.value !== 'rejected',
  );

  const enhance = reduxForm({
    form: USER_PROPOSALS_FILTER_FORM_ID,
    destroyOnUnmount: false,
    initialValues: {
      state: NON_CANCELED_REJECTED_STATES,
    },
  });

  const EnhancedComponent = enhance(SharedProposalsTableFilter);
  return <EnhancedComponent />;
};

const ProposalsTableFilter = ({ form }) => {
  useReinitializeFilterFromUrl(form);
  const enhance = reduxForm({
    form: form,
    destroyOnUnmount: false,
    onChange: syncFiltersToURL,
  });

  const EnhancedComponent = enhance(SharedProposalsTableFilter);
  return <EnhancedComponent />;
};

export { UserProposalsTableFilter, ProposalsTableFilter };

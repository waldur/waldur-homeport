import { Field, reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { PROPOSALS_FILTER_FORM_ID } from '@waldur/proposals/constants';
import {
  CallFilterItem,
  OrganizationFilterItem,
  RoundFilterItem,
} from '@waldur/proposals/filters/CommonFilterItems';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureAdminProposalsTableFilter = ({ form }) => {
  useReinitializeFilterFromUrl(form);
  return (
    <>
      <TableFilterItem
        title={translate('State')}
        name="state"
        instantApply={false}
      >
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={getProposalStateOptions()}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isClearable={true}
              {...REACT_MULTI_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <CallFilterItem />
      <RoundFilterItem />
      <OrganizationFilterItem />
    </>
  );
};

const enhance = reduxForm({
  form: PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
});

export const AdminProposalsTableFilter = enhance(PureAdminProposalsTableFilter);

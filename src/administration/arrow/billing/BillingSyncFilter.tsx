import { reduxForm, Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ARROW_FORM_NAMES, BILLING_SYNC_STATE_OPTIONS } from '../constants';

const PureBillingSyncFilter = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    badgeValue={(value) => value?.label}
  >
    <Field
      name="state"
      component={(props) => (
        <Select
          {...props.input}
          options={BILLING_SYNC_STATE_OPTIONS}
          isClearable
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: ARROW_FORM_NAMES.billingSyncFilter,
  destroyOnUnmount: false,
});

export const BillingSyncFilter = enhance(PureBillingSyncFilter);

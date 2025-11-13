import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const choices = [
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Draft'),
    value: 'draft',
  },
  {
    label: translate('Approved'),
    value: 'approved',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
];

const PureManagedProjectsFilter: FunctionComponent = () => (
  <TableFilterItem name="state" title={translate('State')} instantApply={false}>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={choices}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isClearable={true}
          {...REACT_MULTI_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const ManagedProjectsFilter = reduxForm({
  form: 'managedProjectsFilter',
  initialValues: {
    state: [choices[0]],
  },
  destroyOnUnmount: false,
})(PureManagedProjectsFilter);

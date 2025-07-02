import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const choices = [
  { label: translate('Draft'), value: 'DRAFT' },
  { label: translate('Scheduled'), value: 'SCHEDULED' },
  { label: translate('Sent'), value: 'SENT' },
];

const PureBroadcastFilter = () => (
  <TableFilterItem title={translate('State')} name="state">
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={choices}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: 'BroadcastsFilter',
  destroyOnUnmount: false,
});

export const BroadcastFilter = enhance(PureBroadcastFilter);

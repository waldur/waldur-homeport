import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ADMIN_HOOKS_LIST_FILTER_FORM_ID } from './constants';

const states = [
  {
    label: 'Enabled',
    value: 'true',
  },
  {
    label: 'Disabled',
    value: 'false',
  },
];

const PureHooksListFilter: FunctionComponent<{}> = () => (
  <TableFilterItem title={translate('State')} name="state">
    <Field
      name="state"
      component={(prop) => (
        <Select
          value={prop.input.value}
          onChange={(value) => prop.input.onChange(value)}
          options={states}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: ADMIN_HOOKS_LIST_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const HooksListFilter = enhance(PureHooksListFilter);

import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const choices = [
  {
    label: translate('Organization events'),
    value: 'customers',
  },
  {
    label: translate('Project events'),
    value: 'projects',
  },
  {
    label: translate('Resource events'),
    value: 'resources',
  },
];

const PureCustomerEventsFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('Type')}>
      <Field
        name="feature"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select type...')}
            options={choices}
            value={fieldProps.input.value}
            onChange={(item) => fieldProps.input.onChange(item)}
            isMulti={true}
            isClearable={true}
          />
        )}
      />
    </TableFilterItem>
  </>
);

const enhance = compose(
  reduxForm({
    form: 'customerEventsFilter',
    initialValues: {
      feature: [choices[0]],
    },
    destroyOnUnmount: false,
  }),
);

export const CustomerEventsFilter = enhance(PureCustomerEventsFilter);

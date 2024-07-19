import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const choices = [
  {
    label: translate('Project events'),
    value: 'projects',
  },
  {
    label: translate('Resource events'),
    value: 'resources',
  },
];

const PureProjectEventsFilter: FunctionComponent = () => (
  <TableFilterItem name="feature" title={translate('Type')}>
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
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

const enhance = compose(
  reduxForm({
    form: 'projectEventsFilter',
    initialValues: {
      feature: [choices[0]],
    },
    destroyOnUnmount: false,
  }),
);

export const ProjectEventsFilter = enhance(PureProjectEventsFilter);

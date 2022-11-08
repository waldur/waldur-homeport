import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
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
  <TableFilterFormContainer form="projectEventsFilter">
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
  </TableFilterFormContainer>
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

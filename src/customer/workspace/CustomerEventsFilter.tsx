import * as React from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { translate, withTranslation } from '@waldur/i18n';
import { ToogleButtonFilter } from '@waldur/table-react/ToggleButtonFilter';

const PureCustomerEventsFilter = () => (
  <Field
    name="feature"
    component={props =>
      <ToogleButtonFilter
        choices={[
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
        ]}
        {...props.input}
      />
    }
  />
);

const enhance = compose(
  reduxForm({
    form: 'customerEventsFilter',
    initialValues: {
      feature: ['customers'],
    },
  }),
  withTranslation,
);

export const CustomerEventsFilter = enhance(PureCustomerEventsFilter);

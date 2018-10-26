import * as React from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { translate, withTranslation } from '@waldur/i18n';
import { ToogleButtonFilter } from '@waldur/table-react/ToggleButtonFilter';

const PureProjectEventsFilter = () => (
  <Field
    name="feature"
    component={props =>
      <ToogleButtonFilter
        choices={[
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
    form: 'projectEventsFilter',
    initialValues: {
      feature: ['projects'],
    },
  }),
  withTranslation,
);

export const ProjectEventsFilter = enhance(PureProjectEventsFilter);

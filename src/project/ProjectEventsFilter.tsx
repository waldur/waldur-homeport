import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ToogleButtonFilter } from '@waldur/table/ToggleButtonFilter';

const PureProjectEventsFilter: FunctionComponent = () => (
  <Field
    name="feature"
    component={(props) => (
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
    )}
  />
);

const enhance = compose(
  reduxForm({
    form: 'projectEventsFilter',
    initialValues: {
      feature: ['projects'],
    },
    destroyOnUnmount: false,
  }),
);

export const ProjectEventsFilter = enhance(PureProjectEventsFilter);

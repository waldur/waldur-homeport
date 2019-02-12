import * as React from 'react';
import { reduxForm, InjectedFormProps, Field } from 'redux-form';

import { ChoicesTable } from '@waldur/form-react/ChoicesTable';
import { translate } from '@waldur/i18n';

import { FetchedData } from './ChangePlanLoader';

export const ChangePlanComponent = (props: FetchedData & InjectedFormProps) => (
  <div>
    <p>
      <strong>{translate('Current plan')}</strong>:{' '}
      {props.resource.plan_name}
    </p>
    <div>
      <strong>{translate('New plan')}</strong>
      <Field
        name="plan"
        component={fieldProps => (
          <ChoicesTable
            columns={props.columns}
            choices={props.choices}
            input={fieldProps.input}
          />
        )}
      />
    </div>
  </div>
);

const connector = reduxForm<{}, FetchedData>({form: 'marketplaceChangePlan'});

export const ChangePlanContainer = connector(ChangePlanComponent);

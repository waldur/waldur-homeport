import * as React from 'react';
import { Field } from 'redux-form';

import { ChoicesTable } from '@waldur/form-react/ChoicesTable';
import { translate } from '@waldur/i18n';

import { FetchedData } from './utils';

export const ChangePlanComponent = (props: FetchedData) => (
  <div>
    {props.resource.plan_name ? (
      <p>
        <strong>{translate('Current plan')}</strong>:{' '}
        {props.resource.plan_name}
      </p>
    ) : (
      <p>{translate('Resource does not have any plan.')}</p>
    )}
    {props.choices.length > 1 ? (
      <div>
        <strong>{translate('New plan')}</strong>
        <Field
          name="plan"
          component={fieldProps => (
            <ChoicesTable
              columns={props.columns}
              choices={props.choices.filter(plan => plan.archived === false)}
              input={fieldProps.input}
            />
          )}
        />
      </div>
    ) : (
      <p>{translate('There are no other plans available.')}</p>
    )}
  </div>
);

import * as React from 'react';
import { Field } from 'redux-form';

import { FormGroup } from './FormGroup';

export const FormContainer = props => (
  <div>
    {React.Children.map(props.children, input => (
      <Field
        {...(input as any).props}
        component={FormGroup}
        children={input}
        disabled={props.submitting}
      />
    ))}
  </div>
);

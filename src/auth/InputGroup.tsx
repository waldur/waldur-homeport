import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';
import * as FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

export const InputGroup = ({ fieldName, placeholder, type }) => {
  const renderComponent = React.useCallback(
    ({ input }) => (
      <FormControl type={type} placeholder={placeholder} {...input} />
    ),
    [placeholder, type],
  );

  return (
    <FormGroup>
      <Field name={fieldName} component={renderComponent} />
    </FormGroup>
  );
};

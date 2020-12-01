import React from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
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

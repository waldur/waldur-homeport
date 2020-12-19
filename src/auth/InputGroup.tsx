import { useCallback, FunctionComponent } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

export const InputGroup: FunctionComponent<{
  fieldName;
  placeholder;
  type;
}> = ({ fieldName, placeholder, type }) => {
  const renderComponent = useCallback(
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

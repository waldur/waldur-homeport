import { useCallback, FunctionComponent } from 'react';
import { Field } from 'redux-form';

export const InputGroup: FunctionComponent<{
  fieldName;
  placeholder;
  type;
}> = ({ fieldName, placeholder, type }) => {
  const renderComponent = useCallback(
    ({ input }) => (
      <input
        className="LoginInput"
        type={type}
        placeholder={placeholder}
        {...input}
      />
    ),
    [placeholder, type],
  );

  return <Field name={fieldName} component={renderComponent} />;
};

import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';
import * as FormGroup from 'react-bootstrap/lib/FormGroup';
import { useDispatch } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { change, Field } from 'redux-form';

export const InputGroup = ({
  fieldName,
  formName,
  placeholder,
  type,
  validate,
}) => {
  const dispatch = useDispatch();
  // See also: https://github.com/redux-form/redux-form/issues/812
  const ref = React.useRef<any>();
  const initAutofill = React.useCallback(() => {
    dispatch(change(formName, fieldName, ref.current.value));
  }, [dispatch, ref, fieldName, formName]);
  useEffectOnce(initAutofill);

  const renderComponent = React.useCallback(
    ({ input, meta: { error, touched } }) => (
      <>
        <FormControl
          type={type}
          placeholder={placeholder}
          inputRef={ref}
          {...input}
        />
        {touched && error && <p className="text-danger">{error}</p>}
      </>
    ),
    [placeholder, type],
  );

  return (
    <FormGroup>
      <Field name={fieldName} validate={validate} component={renderComponent} />
    </FormGroup>
  );
};

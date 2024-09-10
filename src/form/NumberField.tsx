import classNames from 'classnames';
import { CSSProperties, FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import { FormField } from './types';

interface NumberFieldProps extends FormField {
  style?: CSSProperties;
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
  placeholder?: string;
  solid?: boolean;
}

export const NumberField: FunctionComponent<NumberFieldProps> = ({
  input,
  unit,
  placeholder = '  ',
  solid,
  ...rest
}) => {
  const control = (
    <Form.Control
      {...input}
      className={classNames(solid && 'form-control-solid', unit && 'has-unit')}
      type="number"
      placeholder={placeholder}
      {...rest}
    />
  );
  if (unit) {
    return (
      <>
        {control}
        <InputGroup.Text className="border-0 unit">{unit}</InputGroup.Text>
      </>
    );
  } else {
    return control;
  }
};

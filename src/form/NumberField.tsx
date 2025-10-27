import classNames from 'classnames';
import { clamp } from 'lodash-es';
import { CSSProperties, FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import { CaretUpDownButtons } from '@waldur/core/CaretUpDownButtons';

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
  description, // eslint-disable-line @typescript-eslint/no-unused-vars
  hideLabel, // eslint-disable-line @typescript-eslint/no-unused-vars
  validate, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...rest
}) => {
  const changeBy = (by: number) =>
    input.onChange(
      clamp(
        Number(input.value || 0) + by,
        Number(rest.min ?? -Infinity),
        Number(rest.max ?? Infinity),
      ),
    );

  return (
    <InputGroup className="input-group-number">
      <Form.Control
        {...input}
        className={classNames(
          solid && 'form-control-solid',
          unit && 'has-unit',
        )}
        type="number"
        placeholder={placeholder}
        {...rest}
      />
      <div className="input-group-addons">
        <CaretUpDownButtons
          onClickUp={() => changeBy(1)}
          onClickDown={() => changeBy(-1)}
        />
        {unit && (
          <InputGroup.Text className="border-0 unit">{unit}</InputGroup.Text>
        )}
      </div>
    </InputGroup>
  );
};

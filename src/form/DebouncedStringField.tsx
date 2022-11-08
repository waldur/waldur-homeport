import { debounce } from 'lodash';
import { FunctionComponent, useState } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from '@waldur/form/types';

interface DebouncedStringFieldProps extends FormField {
  placeholder?: string;
  style?: any;
  maxLength?: number;
  pattern?: string;
}

export const DebouncedStringField: FunctionComponent<DebouncedStringFieldProps> =
  (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { input, label, validate, ...rest } = props;
    const [value, setValue] = useState(props.input.value);

    const debouncedOnChange = debounce((event) => {
      props.input.onChange(event.target.value);
    }, 700);

    const handleChange = (event) => {
      event.persist();
      setValue(event.target.value);
      debouncedOnChange(event);
    };

    return (
      <Form.Control
        {...props.input}
        type="text"
        {...rest}
        value={value}
        onChange={handleChange}
        onBlur={() => {
          if (!props.noUpdateOnBlur) {
            props.input.onBlur(props.input.value);
          }
        }}
      />
    );
  };

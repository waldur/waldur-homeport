import { FunctionComponent, useCallback } from 'react';
import { Form } from 'react-bootstrap';

import { FormField } from './types';

interface TextFieldProps extends FormField {
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  style?;
  solid?: boolean;
}

export const TextField: FunctionComponent<TextFieldProps> = (props) => {
  // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, rows, hideLabel, validate, spaceless, solid, meta, ...rest } =
    props;

  const storeScroll = useCallback((e) => {
    const target = (e.target || e.currentTarget) as HTMLTextAreaElement;
    target.dataset.scroll = String(target.scrollTop);
  }, []);

  return (
    <Form.Control
      as="textarea"
      className={solid && 'form-control-solid'}
      style={props.style}
      placeholder="  "
      onScroll={storeScroll}
      isInvalid={Boolean(meta?.error)}
      {...props.input}
      rows={rows ? rows : 5}
      {...rest}
    />
  );
};

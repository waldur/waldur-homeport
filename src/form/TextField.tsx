import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseTextFieldProps extends FormControlProps {
  rows?: number;
  solid?: boolean;
}

export const BaseTextField: FC<BaseTextFieldProps> = ({
  rows = 5,
  solid,
  className,
  isInvalid,
  ...rest
}) => {
  const storeScroll = useCallback((e) => {
    const target = (e.target || e.currentTarget) as HTMLTextAreaElement;
    target.dataset.scroll = String(target.scrollTop);
  }, []);

  return (
    <Form.Control
      isInvalid={isInvalid}
      as="textarea"
      className={classNames(solid && 'form-control-solid', className)}
      placeholder="  "
      onScroll={storeScroll}
      rows={rows}
      {...rest}
    />
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface TextFieldProps extends Omit<
  BaseTextFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const TextField: FC<TextFieldProps> = ({ input, meta, ...rest }) => (
  <BaseTextField isInvalid={meta.touched && meta.error} {...rest} {...input} />
);

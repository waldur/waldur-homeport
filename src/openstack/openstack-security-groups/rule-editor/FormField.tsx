import classNames from 'classnames';
import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';

export const FormField: FC<WrappedFieldProps> = ({
  input,
  meta: { invalid, error },
  ...rest
}) => (
  <td className={classNames('form-group', { 'has-error': invalid })}>
    <FormControl
      value={input.value}
      onChange={input.onChange}
      {...rest}
      title={error}
    />
  </td>
);

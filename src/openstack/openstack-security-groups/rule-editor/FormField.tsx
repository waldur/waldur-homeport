import classNames from 'classnames';
import { FC } from 'react';
import {
  FormControl,
  OverlayTrigger,
  Tooltip as BootstrapTooltip,
} from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';

export const FormField: FC<WrappedFieldProps & { tooltip?: string }> = ({
  input,
  meta: { invalid, error },
  tooltip,
  ...rest
}) => (
  <td
    className={classNames('form-group', { 'has-error': invalid })}
    style={{ position: 'relative' }}
  >
    <FormControl
      value={input.value}
      onChange={input.onChange}
      {...rest}
      title={error}
    />
    {tooltip ? (
      <OverlayTrigger
        placement="top"
        overlay={<BootstrapTooltip id={input.name}>{tooltip}</BootstrapTooltip>}
      >
        <span style={{ position: 'absolute', right: 16, top: 16 }}>
          <i className="fa fa-question-circle" />
        </span>
      </OverlayTrigger>
    ) : null}
  </td>
);

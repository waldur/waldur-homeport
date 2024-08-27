import { Question } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  cloneElement,
} from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

interface ReadOnlyFormControlProps {
  label: string;
  value: any;
  description?: string;
  addon?: string | number;
  className?: string;
  plaintext?: boolean;
  disabled?: boolean;
  floating?: boolean;
  inline?: boolean;
  actions?: ReactNode;
  tooltip?: string;
}

export const ReadOnlyFormControl: FunctionComponent<
  PropsWithChildren<ReadOnlyFormControlProps>
> = (props) => {
  const {
    label,
    value,
    description,
    plaintext,
    disabled,
    className,
    floating,
    inline,
    addon,
    children,
    actions,
    tooltip,
    ...rest
  } = props;
  const childProps = {
    ...rest,
    input: { name: '', value, onChange: (v) => v },
    value,
    readOnly: true,
    disabled,
  };
  const labelNode = tooltip ? (
    <div className="d-flex justify-content-between flex-grow-1">
      <Form.Label className={inline ? 'mb-0' : undefined}>{label}</Form.Label>
      <Tip
        id={'tip' + (label || tooltip).substring(0, 20).replaceAll(' ', '-')}
        label={tooltip}
        placement="left"
      >
        <Question size={20} weight="bold" className="text-grey-500" />
      </Tip>
    </div>
  ) : (
    <Form.Label className={inline ? 'mb-0' : undefined}>{label}</Form.Label>
  );

  const main = (
    <div
      className={classNames(
        'mb-7',
        className,
        floating && 'form-floating',
        addon && 'form-addon',
        Boolean(actions) && 'flex-grow-1',
        inline && 'd-flex align-items-center',
      )}
    >
      {!floating && labelNode}
      {children ? (
        cloneElement(children as any, childProps)
      ) : (
        <Form.Control
          readOnly
          plaintext={plaintext}
          className={classNames(!plaintext && 'form-control-solid')}
          defaultValue={value}
          disabled={disabled}
        />
      )}
      {description && (
        <Form.Text muted={true} className="mb-0">
          {description}
        </Form.Text>
      )}
      {floating && labelNode}
      {addon && <span className="form-control-addon">{addon}</span>}
    </div>
  );

  if (actions) {
    return (
      <div className="d-flex align-items-start gap-4">
        {main}
        {actions}
      </div>
    );
  }
  return main;
};

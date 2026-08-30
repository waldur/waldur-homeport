import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';

export interface ReadOnlyChildProps {
  input: {
    name: string;
    value: any;
    onChange: (v: any) => void;
    onBlur: (v: any) => void;
    onFocus: (v: any) => void;
  };
  value: any;
  readOnly: boolean;
  disabled?: boolean;
}

interface ReadOnlyFormControlProps {
  label: string;
  value: any;
  description?: string;
  addon?: string | number;
  className?: string;
  plaintext?: boolean;
  disabled?: boolean;
  inline?: boolean;
  spaceless?: boolean;
  actions?: ReactNode;
  tooltip?: string;
  children?: ReactNode | ((props: ReadOnlyChildProps) => ReactNode);
}

export const ReadOnlyFormControl: FunctionComponent<
  ReadOnlyFormControlProps
> = (props) => {
  const {
    label,
    value,
    description,
    plaintext,
    disabled,
    className,
    inline,
    spaceless,
    addon,
    children,
    actions,
    tooltip,
    ...rest
  } = props;
  const childProps = {
    ...rest,
    input: {
      name: '',
      value,
      onChange: (v) => v,
      onBlur: (v) => v,
      onFocus: (v) => v,
    },
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
        <QuestionIcon size={20} weight="bold" className="text-gray-500" />
      </Tip>
    </div>
  ) : (
    <Form.Label className={inline ? 'mb-0' : undefined}>{label}</Form.Label>
  );

  const main = (
    <div
      className={classNames(
        !spaceless && 'mb-7',
        className,
        addon && 'form-addon',
        Boolean(actions) && 'flex-grow-1',
        inline && 'd-flex align-items-center',
      )}
    >
      {labelNode}
      {children ? (
        typeof children === 'function' ? (
          children(childProps)
        ) : (
          children
        )
      ) : (
        // Controlled, not `defaultValue`: a read-only field whose value is
        // derived (a project duration, a computed total) must follow the
        // prop when it resolves, not keep whatever the first render held.
        <Form.Control
          readOnly
          plaintext={plaintext}
          className={classNames(!plaintext && 'form-control-solid')}
          value={value ?? ''}
          disabled={disabled}
        />
      )}
      {description && (
        <Form.Text muted={true} className="mb-0">
          {description}
        </Form.Text>
      )}
      {addon && <span className="form-control-addon">{addon}</span>}
    </div>
  );

  if (actions) {
    return (
      <div className="d-flex align-items-start gap-2">
        {main}
        {actions}
      </div>
    );
  }
  return main;
};

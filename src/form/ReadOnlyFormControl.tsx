import classNames from 'classnames';
import {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  cloneElement,
} from 'react';
import { Form } from 'react-bootstrap';

interface ReadOnlyFormControlProps {
  label: string;
  value: any;
  description?: string;
  addon?: string | number;
  className?: string;
  plaintext?: boolean;
  disabled?: boolean;
  actions?: ReactNode;
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
    addon,
    children,
    actions,
    ...rest
  } = props;
  const childProps = {
    ...rest,
    input: { name: '', value, onChange: (v) => v },
    value,
    readOnly: true,
    disabled,
  };
  const labelNode = <Form.Label>{label}</Form.Label>;

  const main = (
    <div
      className={classNames(
        'mb-7',
        className,
        addon && 'form-addon',
        Boolean(actions) && 'flex-grow-1',
      )}
    >
      {labelNode}
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

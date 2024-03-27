import classNames from 'classnames';
import { FunctionComponent, cloneElement } from 'react';
import { Form } from 'react-bootstrap';

interface ReadOnlyFormControlProps {
  label: string;
  value: any;
  description?: string;
  addon?: string | number;
  className?: string;
  plaintext?: boolean;
  disabled?: boolean;
  floating?: boolean;
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
    floating,
    addon,
    children,
    ...rest
  } = props;
  const childProps = {
    ...rest,
    input: { name: '', value },
    value,
    readOnly: true,
    disabled,
  };
  const labelNode = <Form.Label>{label}</Form.Label>;

  return (
    <div
      className={classNames(
        'mb-7',
        className,
        floating && 'form-floating',
        addon && 'form-addon',
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
};

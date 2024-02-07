import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

interface ReadOnlyFormControlProps {
  label: string;
  value: string | number;
  description?: string;
  addon?: string | number;
  className?: string;
  plaintext?: boolean;
  disabled?: boolean;
  floating?: boolean;
}

export const ReadOnlyFormControl: FunctionComponent<ReadOnlyFormControlProps> =
  (props) => {
    const labelNode = <Form.Label>{props.label}</Form.Label>;

    return (
      <div
        className={classNames(
          'mb-7',
          props.className,
          props.floating && 'form-floating',
          props.addon && 'form-addon',
        )}
      >
        {!props.floating && labelNode}
        <Form.Control
          readOnly
          plaintext={props.plaintext}
          className={classNames(!props.plaintext && 'form-control-solid')}
          defaultValue={props.value}
          disabled={props.disabled}
        />
        {props.description && (
          <Form.Text muted={true} className="mb-0">
            {props.description}
          </Form.Text>
        )}
        {props.floating && labelNode}
        {props.addon && (
          <span className="form-control-addon">{props.addon}</span>
        )}
      </div>
    );
  };

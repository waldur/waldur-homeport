import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';

import { FormField, FormLabel, FormText, HelpIcon } from 'waldur-ui';

import { BaseInputField } from './InputField';

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
    <div className="flex justify-between grow">
      <FormLabel className={inline ? 'mb-0' : undefined}>{label}</FormLabel>
      <HelpIcon label={tooltip} side="left" size={20} />
    </div>
  ) : (
    <FormLabel className={inline ? 'mb-0' : undefined}>{label}</FormLabel>
  );

  const main = (
    <FormField
      className={classNames(
        !spaceless && 'mb-5.5',
        className,
        Boolean(actions) && 'grow',
        inline && 'flex items-center',
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
        <BaseInputField
          readOnly
          plaintext={plaintext}
          solid={!plaintext}
          value={value ?? ''}
          disabled={disabled}
          end={addon}
        />
      )}
      {description && (
        <FormText variant="muted" className="mb-0">
          {description}
        </FormText>
      )}
    </FormField>
  );

  if (actions) {
    return (
      <div className="flex items-start gap-1.5">
        {main}
        {actions}
      </div>
    );
  }
  return main;
};

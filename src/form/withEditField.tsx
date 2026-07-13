import { FieldValidator } from 'final-form';
import { get } from 'lodash-es';
import { ComponentType, FC, ReactNode } from 'react';
import { FieldProps } from 'react-final-form';

import { CheckOrX } from '@/core/CheckOrX';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { TruncatedDescription } from '@/core/TruncatedDescription';
import { SecretField as PlainSecretField } from '@/marketplace/common/SecretField';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { useUser } from '@/workspace/hooks';

import { AwesomeCheckboxField } from './AwesomeCheckboxField';
import { CommaSeparatedListField } from './CommaSeparatedListField';
import { useEditFieldContext } from './EditFieldContext';
import { FieldEditButton } from './FieldEditButton';
import FormTable from './FormTable';
import { SecretField as FormSecretField } from './SecretField';
import { TextField } from './TextField';

/** Props accepted by an edit field produced via withEditField. */
export type EditFieldProps<P = object> = Omit<
  P,
  'input' | 'meta' | 'name' | 'label' | 'description' | 'disabled'
> & {
  /** The key path into scope, e.g. 'service_attributes.backend_url' */
  name: string;
  label: string;
  description?: ReactNode;
  /**
   * When true, `description` is surfaced only in the edit dialog (as its
   * subtitle) and omitted from the static read-only row. Use for long help
   * blocks (e.g. a placeholder reference table) that would bloat the row.
   */
  descriptionInEditOnly?: boolean;
  disabled?: boolean;
  warnTooltip?: string;
  isStaffOnly?: boolean;
  hideLabel?: boolean;
  required?: boolean;
  validate?: FieldValidator<any>;
  format?: NonNullable<FieldProps<any, any>['format']> | null;
  parse?: NonNullable<FieldProps<any, any>['parse']>;
  normalize?: (value: any) => any;

  /** Override the read-only value display */
  renderValue?(value: any): ReactNode;

  tooltip?: string;
  iconNode?: ReactNode;
  actions?: ReactNode;
};

interface WithEditFieldOptions {
  /**
   * Custom default display for the read-only value.
   * If not provided, falls back to auto-detection based on WrappedComponent identity.
   */
  displayValue?: (value: any, props: any) => ReactNode;
  /** When true, label is forwarded to the control (e.g. for checkbox fields) */
  passLabelToControl?: boolean;
}

/**
 * A Higher-Order Component that wraps a basic form input component with a FormTable.Item
 * and a FieldEditButton. This creates a fully autonomous Edit Field component.
 *
 * Follows the same pattern as `withFormGroup` (form fields) and `withTableFilter` (table filters).
 *
 * @example
 * ```tsx
 * const StringEditField = withEditField(StringField);
 *
 * <EditFieldProvider scope={offering} callback={update}>
 *   <StringEditField
 *     name="service_attributes.backend_url"
 *     label={translate('API URL')}
 *     required
 *     validate={required}
 *   />
 * </EditFieldProvider>
 * ```
 */
export function withEditField<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithEditFieldOptions,
): FC<EditFieldProps<P>> {
  const EditField: FC<EditFieldProps<P>> = (props) => {
    const {
      name,
      label,
      description,
      descriptionInEditOnly,
      disabled,
      warnTooltip,
      isStaffOnly,
      hideLabel,
      renderValue,
      tooltip,
      iconNode,
      // FieldProps we need to forward to FieldEditButton
      required,
      validate,
      format,
      parse,
      normalize,
      // Everything else is field-component-specific props
      ...fieldSpecificProps
    } = props;

    const ctx = useEditFieldContext();
    const scope = ctx?.scope;
    const callback = ctx?.callback;

    if (!scope || !callback) {
      throw new Error(
        `<${EditField.displayName}>: "scope" and "callback" must be provided either via props or via <EditFieldProvider>.`,
      );
    }

    const user = useUser();
    const isStaff = user?.is_staff;

    const rawValue = get(scope, name);

    // Determine the display value. Custom render functions are expected to
    // produce a renderable node — fall back to a dash when they return
    // null/undefined so empty values stay consistent with the dash convention.
    const rendered = renderValue
      ? renderValue(rawValue)
      : options?.displayValue
        ? options.displayValue(rawValue, props)
        : getDefaultDisplayValue(
            WrappedComponent,
            rawValue,
            fieldSpecificProps,
          );
    const displayValue = rendered ?? DASH_ESCAPE_CODE;

    // Collect fieldProps to pass to the edit dialog
    const fieldProps: Record<string, any> = { ...fieldSpecificProps };
    if (required != null) fieldProps.required = required;
    if (validate != null) fieldProps.validate = validate;
    if (format != null) fieldProps.format = format;
    if (parse != null) fieldProps.parse = parse;
    if (normalize != null) fieldProps.normalize = normalize;

    const editButton = (
      <FieldEditButton
        title={label}
        description={description as string}
        scope={scope}
        name={name}
        callback={callback}
        fieldComponent={WrappedComponent as any}
        fieldProps={fieldProps}
        hideLabel={hideLabel}
        tooltip={tooltip ?? (disabled ? ctx?.readOnlyReason : undefined)}
        iconNode={iconNode}
        disabled={disabled}
      />
    );

    // Staff-only fields always show the indicator: alongside the edit button
    // for staff (informational), and in place of it for non-staff (read-only).
    const actions = !isStaffOnly ? (
      editButton
    ) : isStaff ? (
      <>
        <StaffOnlyIndicator />
        {editButton}
      </>
    ) : (
      <StaffOnlyIndicator />
    );

    return (
      <FormTable.Item
        label={label}
        description={descriptionInEditOnly ? undefined : description}
        value={displayValue}
        required={required}
        disabled={disabled}
        warnTooltip={warnTooltip}
        actions={actions}
      />
    );
  };

  EditField.displayName = `withEditField(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return EditField;
}

/** Auto-detect a sensible read-only display based on the field component identity. */
function getDefaultDisplayValue(
  Component: ComponentType<any>,
  value: any,
  props: any,
): ReactNode {
  if (Component === TextField) {
    return <TruncatedDescription text={value || DASH_ESCAPE_CODE} />;
  }
  if (Component === FormSecretField) {
    return <PlainSecretField value={value} />;
  }
  if (Component === AwesomeCheckboxField) {
    return <CheckOrX value={value} />;
  }
  if (Component === CommaSeparatedListField) {
    const items = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
    return items.join(', ');
  }
  // SelectField-like: check for options prop
  if (props?.options) {
    const opts = props.options as { value: any; label: string }[] | undefined;
    const labelFor = (v: any) => {
      const match = opts?.find((o) => o.value === v);
      return match ? match.label : String(v);
    };
    if (Array.isArray(value)) {
      if (value.length === 0) return DASH_ESCAPE_CODE;
      return value.map(labelFor).join(', ');
    }
    if (value == null || value === '') return DASH_ESCAPE_CODE;
    return labelFor(value);
  }
  return value ?? DASH_ESCAPE_CODE;
}

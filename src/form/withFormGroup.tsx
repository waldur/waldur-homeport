import { uniqueId } from 'lodash-es';
import { ComponentType, FC, useMemo } from 'react';
import { Field, UseFieldConfig } from 'react-final-form';

import { FormGroup, FormGroupProps } from './FormGroup';

// We omit 'component' and 'render' from FieldProps because the HOC provides the component.
// We use UseFieldConfig directly instead of FieldProps because FieldProps has
// an index signature ([otherProp: string]: any) that prevents mapped types
// from preserving named keys like 'validate', 'format', 'parse', etc.
type AutonomousFieldProps<P> = Omit<P, 'input' | 'meta' | 'id'> &
  FormGroupProps &
  UseFieldConfig<any> & {
    name: string;
  };

/**
 * A Higher-Order Component that wraps a basic input component with a FormGroup AND a react-final-form Field.
 * This creates a fully autonomous Field component, allowing you to use `<StringGroup name="firstName" />`
 * instead of `<Field name="firstName" component={StringGroup} />`.
 */
export function withFormGroup<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: { passLabelToControl?: boolean },
): FC<AutonomousFieldProps<P>> {
  // Inner component that is passed to React Final Form's Field
  const InnerComponent: FC<P & FormGroupProps & any> = (props) => {
    const {
      input,
      meta,
      label,
      required,
      description,
      tooltip,
      help,
      tooltipEnd,
      helpEnd,
      tooltipProps,
      hideLabel,
      hideError,
      actions,
      quickAction,
      className,
      containerClassName,
      spaceless,
      space,
      id,
      controlId: propsControlId,
      forceTouched,
      ...rest
    } = props;

    const controlId = useMemo(
      () => propsControlId || id || input?.name || uniqueId('form-group-'),
      [propsControlId, id, input?.name],
    );

    // Group FormGroup-specific props
    const formGroupProps: FormGroupProps = {
      input,
      label: options?.passLabelToControl ? undefined : label,
      required,
      description,
      tooltip: options?.passLabelToControl ? undefined : tooltip,
      help,
      tooltipEnd,
      helpEnd,
      tooltipProps,
      hideLabel: options?.passLabelToControl ? true : hideLabel,
      hideError,
      actions,
      quickAction,
      className,
      containerClassName,
      spaceless,
      space,
      id,
      controlId,
      meta: forceTouched ? { ...meta, touched: true } : meta, // Pass meta to FormGroup so it can render FieldError natively
    };

    const componentProps = options?.passLabelToControl
      ? { ...rest, label, tooltip, tooltipEnd }
      : rest;

    // The rest of the props are intended for the WrappedComponent, including `input` bindings
    return (
      <FormGroup {...formGroupProps}>
        <WrappedComponent
          input={input}
          meta={meta}
          id={controlId}
          {...(componentProps as any)}
        />
      </FormGroup>
    );
  };

  InnerComponent.displayName = `withFormGroupInner(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  const OuterField: FC<AutonomousFieldProps<P>> = (props) => {
    return <Field {...props} component={InnerComponent} />;
  };

  OuterField.displayName = `withFormGroup(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return OuterField;
}

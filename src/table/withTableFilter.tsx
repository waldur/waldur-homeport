import { ComponentType, FC } from 'react';
import { Field, FieldProps } from 'react-final-form';

import { TableFilterItem, TableFilterItemProps } from './TableFilterItem';

// Remove index signatures
type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K];
};

type AutonomousFilterProps<P> = Omit<P, 'input' | 'meta'> &
  TableFilterItemProps &
  RemoveIndex<
    Omit<FieldProps<any, any>, 'component' | 'render' | 'children'>
  > & {
    name: string;
  };

/**
 * A Higher-Order Component that wraps a basic input component with a TableFilterItem AND a react-final-form Field.
 * This creates a fully autonomous Filter component.
 */
export function withTableFilter<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: { passLabelToControl?: boolean },
): FC<AutonomousFilterProps<P>> {
  const InnerComponent: FC<P & TableFilterItemProps & any> = (props) => {
    const {
      input,
      meta,
      title,
      badgeValue,
      getValueLabel,
      ellipsis,
      showValueBadge,
      hideRemoveButton,
      onApply,
      instantApply,
      ...rest
    } = props;

    const filterItemProps: TableFilterItemProps = {
      title,
      name: input.name,
      badgeValue,
      getValueLabel,
      ellipsis,
      showValueBadge,
      hideRemoveButton,
      onApply,
      instantApply,
    };

    const componentProps = options?.passLabelToControl
      ? { ...rest, label: title }
      : rest;

    return (
      <TableFilterItem {...filterItemProps}>
        <WrappedComponent
          input={input}
          meta={meta}
          {...(componentProps as any)}
        />
      </TableFilterItem>
    );
  };

  InnerComponent.displayName = `withTableFilterInner(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  const OuterField: FC<AutonomousFilterProps<P>> = (props) => {
    return <Field {...props} component={InnerComponent} />;
  };

  OuterField.displayName = `withTableFilter(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return OuterField;
}

import { ComponentType, FC, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setFilter } from './actions';
import { TableFilterContext } from './FilterContextProvider';
import { selectFilterValue } from './selectors';
import { TableFilterItem, TableFilterItemProps } from './TableFilterItem';

type AutonomousFilterProps<P> = Omit<P, 'input' | 'meta'> &
  TableFilterItemProps & {
    name: string;
    initialValue?: any;
    validate?: any;
  };

/**
 * A Higher-Order Component that wraps a basic input component with a TableFilterItem AND a Redux connection.
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

    const filterItemProps: TableFilterItemProps = useMemo(
      () => ({
        title,
        name: input.name,
        badgeValue,
        getValueLabel,
        ellipsis,
        showValueBadge,
        hideRemoveButton,
        onApply,
        instantApply,
      }),
      [
        title,
        input.name,
        badgeValue,
        getValueLabel,
        ellipsis,
        showValueBadge,
        hideRemoveButton,
        onApply,
        instantApply,
      ],
    );

    const componentProps = useMemo(
      () => (options?.passLabelToControl ? { ...rest, label: title } : rest),
      [options?.passLabelToControl, rest, title],
    );

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
    const { table } = useContext(TableFilterContext);
    const dispatch = useDispatch();
    const value = useSelector(selectFilterValue(table, props.name));

    const input = useMemo(
      () => ({
        name: props.name,
        value: value ?? props.initialValue ?? null,
        onChange: (newValue: any) => {
          dispatch(
            setFilter(table, {
              name: props.name,
              value: newValue,
              label: props.title,
              component: null, // set by TableFilterItem
            }),
          );
        },
        onBlur: () => {},
        onFocus: () => {},
      }),
      [value, props.name, table, dispatch, props.title, props.initialValue],
    );

    const meta = useMemo(() => ({ touched: false, error: undefined }), []);

    return <InnerComponent {...props} input={input} meta={meta} />;
  };

  OuterField.displayName = `withTableFilter(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return OuterField;
}

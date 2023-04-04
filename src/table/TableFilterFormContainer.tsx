import React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

interface TableFilterFormContainerPureProps {
  filterValues: Object;
}

const TableFilterFormContainerPure: React.FC<TableFilterFormContainerPureProps> =
  (props) => {
    const children =
      typeof props.children === 'function'
        ? props.children({ values: props.filterValues }).props.children
        : props.children;

    return React.Children.map(children, (filterItem: any) => {
      if (!filterItem) return;
      const { name, children } = filterItem.props;
      let input;
      if (children instanceof Array) {
        input = children[0];
      } else {
        input = children;
      }
      const inputName = name || input?.props?.name;

      if (React.isValidElement(filterItem) && inputName) {
        return React.cloneElement(filterItem, {
          value: props.filterValues && props.filterValues[inputName],
        } as any);
      }
      return filterItem;
    });
  };

const mapStateToProps = (
  state: RootState,
  ownProps: { form: string; children? },
) => ({
  filterValues: getFormValues(ownProps.form)(state),
});

export const TableFilterFormContainer = connect(mapStateToProps)(
  TableFilterFormContainerPure,
);

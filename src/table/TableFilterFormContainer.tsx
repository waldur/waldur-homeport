import React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

interface TableFilterFormContainerPureProps {
  filterValues: Object;
}

const TableFilterFormContainerPure: React.FC<TableFilterFormContainerPureProps> =
  (props) => {
    return React.Children.map(props.children, (filterItem: any) => {
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

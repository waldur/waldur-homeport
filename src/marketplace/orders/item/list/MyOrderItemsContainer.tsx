import * as React from 'react';
import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';
import { connectAngularComponent } from '@waldur/store/connect';

import { setOrderStateFilter } from '../../store/actions';
import { MyOrderItemsFilter } from './MyOrderItemsFilter';
import { MyOrderItemsList } from './MyOrderItemsList';

interface StateOptions {
  value: string;
  label: string;
}

interface Props {
  orderFilterStateOptions: StateOptions[];
  setOrderStateFilter: (arg: StateOptions) => void;
}

class PureOrderItemsContainer extends React.Component<Props> {

  componentWillMount() {
    const { filterState } = $state.params;
    if (filterState) {
      const filterOptions = this.props.orderFilterStateOptions;
      const filterOption = filterOptions.find(op => op.value === filterState);
      if (filterOption) {
        this.props.setOrderStateFilter(filterOption);
      }
    }
  }

  render() {
    return (
      <div className="ibox-content">
        <MyOrderItemsFilter/>
        <MyOrderItemsList/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    orderFilterStateOptions: state.marketplace.orders.tableFilter.stateOptions,
  };
};

const mapDispatchToProps = dispatch => ({
  setOrderStateFilter: filterOption =>
      dispatch(setOrderStateFilter('MyOrderItemsFilter', filterOption)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

const OrderItemsContainer = enhance(PureOrderItemsContainer);

export default connectAngularComponent(OrderItemsContainer);

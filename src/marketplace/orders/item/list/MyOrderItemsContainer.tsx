import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

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

const filterOptionsSelector = state =>
  state.marketplace.orders.tableFilter.stateOptions;

const OrderItemsContainer: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const filterOptions = useSelector(filterOptionsSelector);
  React.useEffect(() => {
    const { filterState } = $state.params;
    if (filterState) {
      const filterOption = filterOptions.find(op => op.value === filterState);
      if (filterOption) {
        dispatch(setOrderStateFilter('MyOrderItemsFilter', filterOption));
      }
    }
  }, [filterOptions, dispatch]);

  return (
    <div className="ibox-content">
      <MyOrderItemsFilter />
      <MyOrderItemsList />
    </div>
  );
};

export default connectAngularComponent(OrderItemsContainer);

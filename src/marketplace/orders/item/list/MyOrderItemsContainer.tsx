import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { $state } from '@waldur/core/services';

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

export const MyOrderItemsContainer: React.FC<Props> = () => {
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
    <Panel>
      <MyOrderItemsFilter />
      <MyOrderItemsList />
    </Panel>
  );
};

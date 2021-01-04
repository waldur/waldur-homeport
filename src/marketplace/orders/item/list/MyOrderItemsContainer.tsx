import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';

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

const filterOptionsSelector = (state: RootState) =>
  state.marketplace.orders.tableFilter.stateOptions;

export const MyOrderItemsContainer: React.FC<Props> = () => {
  useTitle(translate('My orders'));
  const dispatch = useDispatch();
  const filterOptions = useSelector(filterOptionsSelector);
  React.useEffect(() => {
    const { filterState } = router.globals.params;
    if (filterState) {
      const filterOption = filterOptions.find((op) => op.value === filterState);
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

import React from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';

import { MyOrderItemsFilter } from './MyOrderItemsFilter';
import { MyOrderItemsList } from './MyOrderItemsList';
import { getOrderStateFilterOption } from './OrderStateFilter';

export const MyOrderItemsContainer: React.FC<{}> = () => {
  useTitle(translate('My orders'));
  const dispatch = useDispatch();
  const filterOptions = getOrderStateFilterOption();
  React.useEffect(() => {
    const { filterState } = router.globals.params;
    if (filterState) {
      const filterOption = filterOptions.find((op) => op.value === filterState);
      if (filterOption) {
        dispatch(change('MyOrderItemsFilter', 'state', filterOption));
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

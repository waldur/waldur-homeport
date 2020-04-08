import * as React from 'react';
import { useSelector } from 'react-redux';

import { useQuery } from '@waldur/core/useQuery';
import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { SidebarMenuProps } from '@waldur/navigation/sidebar/types';
import { mergeItems, getCounterFields } from '@waldur/navigation/sidebar/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  getSidebarItems,
  getCustomerCounters,
  getExtraSidebarItems,
} from './utils';

export const CustomerSidebar = () => {
  const customer = useSelector(getCustomer);

  const { state, call } = useQuery<SidebarMenuProps>(async () => {
    if (!customer) {
      throw 404;
    }
    const sidebarItems = getSidebarItems(customer);
    const extraItems = await getExtraSidebarItems();
    const items = mergeItems(sidebarItems, extraItems);
    const fields = getCounterFields(items);
    const counters = await getCustomerCounters(customer, fields);
    return { items, counters };
  }, []);

  React.useEffect(() => {
    call();
  }, [customer]);

  return <Sidebar items={state.data?.items} counters={state.data?.counters} />;
};

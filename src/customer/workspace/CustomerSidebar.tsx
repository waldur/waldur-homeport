import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

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

  const { value } = useAsync<SidebarMenuProps>(async () => {
    if (!customer) {
      throw 404;
    }
    const sidebarItems = getSidebarItems(customer);
    const extraItems = await getExtraSidebarItems();
    const items = mergeItems(sidebarItems, extraItems);
    const fields = getCounterFields(items);
    const counters = await getCustomerCounters(customer, fields);
    return { items, counters };
  }, [customer]);

  return <Sidebar items={value?.items} counters={value?.counters} />;
};

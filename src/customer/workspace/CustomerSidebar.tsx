import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { getPublicServices } from '@waldur/marketplace/sidebar';
import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { SidebarMenuProps } from '@waldur/navigation/sidebar/types';
import { mergeItems, getCounterFields } from '@waldur/navigation/sidebar/utils';
import {
  checkIsServiceManager,
  getCustomer,
  getUser,
} from '@waldur/workspace/selectors';

import {
  getSidebarItems,
  getCustomerCounters,
  getExtraSidebarItems,
  getDashboardItem,
} from './utils';

export const CustomerSidebar: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);

  const { value } = useAsync<SidebarMenuProps>(async () => {
    if (!customer) {
      throw 404;
    }
    if (checkIsServiceManager(customer, user)) {
      return {
        items: [
          getDashboardItem(customer.uuid),
          getPublicServices(customer.uuid),
        ],
      };
    }
    const sidebarItems = getSidebarItems(customer);
    const extraItems = await getExtraSidebarItems();
    const items = mergeItems(sidebarItems, extraItems);
    const fields = getCounterFields(items);
    const counters = await getCustomerCounters(customer, fields);
    return { items, counters };
  }, [customer, user]);

  return <Sidebar items={value?.items} counters={value?.counters} />;
};

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import {
  getSidebarItems,
  getExtraCustomerSidebarItems,
  getDashboardItem,
} from '@waldur/customer/workspace/utils';
import { translate } from '@waldur/i18n';
import { IssueNavigationService } from '@waldur/issues/workspace/IssueNavigationService';
import {
  getPublicServices,
  getResourceSidebarItems,
} from '@waldur/marketplace/sidebar';
import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import {
  getExtraProjectSidebarItems,
  getProjectSidebarItems,
} from '@waldur/project/utils';
import {
  checkIsServiceManager,
  getCustomer,
  getProject,
  getUser,
} from '@waldur/workspace/selectors';

import { SidebarSection } from './types';
import { mergeItems } from './utils';

export const UnifiedSidebar = () => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const [customerItems, setCustomerItems] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [projectItems, setProjectItems] = useState([]);
  const [resourceItems, setResourceItems] = useState([]);

  useAsync(async () => {
    if (!customer) {
      throw 404;
    }
    if (checkIsServiceManager(customer, user) && !user.is_staff) {
      return {
        items: [
          getDashboardItem(customer.uuid),
          getPublicServices(customer.uuid),
        ],
      };
    }
    const sidebarItems = getSidebarItems(customer).filter(Boolean);
    const extraItems = await getExtraCustomerSidebarItems();
    const items = mergeItems(sidebarItems, extraItems);
    setCustomerItems(items);
  }, [customer, user]);

  useEffect(() => {
    IssueNavigationService.getSidebarItems().then(setAdminItems);
  }, []);

  const project = useSelector(getProject);
  const sidebarItems = useSelector(getProjectSidebarItems);

  useAsync(async () => {
    const extraItems = await getExtraProjectSidebarItems();
    const items = mergeItems(sidebarItems.filter(Boolean), extraItems);
    setProjectItems(items);
  }, [project]);

  useAsync(async () => {
    const items = await getResourceSidebarItems(project);
    setResourceItems(items);
  }, [project]);

  const sections: SidebarSection[] = useMemo(
    () => [
      { label: translate('Admin'), items: adminItems },
      { label: translate('Resources'), items: resourceItems },
      { label: translate('Project management'), items: projectItems },
      { label: translate('Org management'), items: customerItems },
    ],
    [customerItems, adminItems, projectItems, resourceItems],
  );
  return <Sidebar sections={sections} />;
};

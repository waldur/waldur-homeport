import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';
import store from '@waldur/store/store';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import {
  PROJECT_WORKSPACE,
  ORGANIZATION_WORKSPACE,
} from '@waldur/workspace/types';

import { getCategoryLink } from './utils';

SidebarExtensionService.register(ORGANIZATION_WORKSPACE, () => {
  const customer = getCustomer(store.getState());
  if (!customer) {
    return [];
  }
  const items = [
    {
      key: 'marketplace',
      icon: 'fa-shopping-cart',
      label: translate('Marketplace'),
      state: 'marketplace-landing-customer',
      params: {
        uuid: customer.uuid,
      },
      index: 210,
    },
  ];

  if (customer.is_service_provider) {
    return [
      ...items,
      {
        key: 'marketplace-services',
        label: translate('My services'),
        icon: 'fa-shopping-cart',
        index: 310,
        children: [
          {
            label: translate('My offerings'),
            icon: 'fa-file',
            state: 'marketplace-my-offerings',
            params: {
              uuid: customer.uuid,
            },
            feature: 'marketplace.my-offerings',
          },
          {
            key: 'marketplace',
            icon: 'fa-file',
            label: translate('My orders'),
            state: 'marketplace-my-order-items',
            params: {
              uuid: customer.uuid,
            },
          },
          {
            icon: 'fa-file',
            label: translate('My resources'),
            state: 'marketplace-customer-resources',
            params: {
              uuid: customer.uuid,
            },
          },
        ],
      },
      {
        key: 'marketplace-services',
        label: translate('Public services'),
        icon: 'fa-money',
        index: 310,
        children: [
          {
            label: translate('Public offerings'),
            icon: 'fa-money',
            state: 'marketplace-vendor-offerings',
          },
          {
            key: 'marketplace',
            icon: 'fa-money',
            label: translate('Public orders'),
            state: 'marketplace-order-items',
            params: {
              uuid: customer.uuid,
            },
          },
          {
            icon: 'fa-money',
            label: translate('Public resources'),
            state: 'marketplace-public-resources',
            params: {
              uuid: customer.uuid,
            },
          },
        ],
      },
    ];
  } else {
    return [
      ...items,
      {
        key: 'marketplace-services',
        label: translate('My services'),
        icon: 'fa-shopping-cart',
        index: 310,
        children: [
          {
            label: translate('My offerings'),
            icon: 'fa-file',
            state: 'marketplace-my-offerings',
            params: {
              uuid: customer.uuid,
            },
            feature: 'marketplace.my-offerings',
          },
          {
            icon: 'fa-file',
            label: translate('My resources'),
            state: 'marketplace-customer-resources',
            params: {
              uuid: customer.uuid,
            },
          },
          {
            key: 'marketplace',
            icon: 'fa-file',
            label: translate('My orders'),
            state: 'marketplace-my-order-items',
            params: {
              uuid: customer.uuid,
            },
          },
        ],
      },
    ];
  }
});

SidebarExtensionService.register(PROJECT_WORKSPACE, async () => {
  const project = getProject(store.getState());
  const categories = await getCategories({
    params: { field: ['uuid', 'title'] },
  });

  return [
    {
      key: 'marketplace',
      icon: 'fa-shopping-cart',
      label: translate('Marketplace'),
      state: 'marketplace-landing',
      params: {
        uuid: project.uuid,
      },
      index: 210,
    },
    {
      label: translate('My orders'),
      icon: 'fa-folder-open',
      state: 'marketplace-order-list',
      params: {
        uuid: project.uuid,
      },
      index: 220,
    },
    {
      key: 'marketplace-project-resources',
      label: translate('Resources'),
      icon: 'fa-files-o',
      index: 300,
      children: categories.map((category) => ({
        label: category.title,
        icon: 'fa-cloud',
        ...getCategoryLink(project.uuid, category.uuid),
        countFieldKey: `marketplace_category_${category.uuid}`,
      })),
    },
  ];
});

import { getCategories } from '@waldur/marketplace/common/api';

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService, currentStateService, features) {
  SidebarExtensionService.register('customer', () => {
    return currentStateService.getCustomer().then(customer => {
      if (customer && customer.is_service_provider) {
        return [
          {
            label: gettext('Marketplace offerings'),
            icon: 'fa-file',
            link: 'marketplace-vendor-offerings({uuid: $ctrl.context.customer.uuid})',
            feature: 'marketplace',
          },
          {
            key: 'marketplace',
            icon: 'fa-file',
            label: gettext('Order items'),
            feature: 'marketplace',
            link: 'marketplace-order-items({uuid: $ctrl.context.customer.uuid})',
            index: 220,
          },
        ];
      } else {
        return [];
      }
    });
  });

  SidebarExtensionService.register('project', () => {
    return [
      {
        key: 'marketplace',
        icon: 'fa-shopping-cart',
        label: gettext('Marketplace'),
        feature: 'marketplace',
        link: 'marketplace-landing({uuid: $ctrl.context.project.uuid})',
        index: 210,
      },
      {
        label: gettext('Marketplace orders'),
        icon: 'fa-folder-open',
        link: 'marketplace-order-list({uuid: $ctrl.context.project.uuid})',
        feature: 'marketplace',
        index: 220,
      }
    ];
  });

  SidebarExtensionService.register('project', () => {
    if (features.isVisible('marketplace')) {
      return getCategories({params: {field: ['uuid', 'title']}}).then(categories => {
        const children = categories.map(category => ({
          label: category.title,
          icon: 'fa-cloud',
          link: `marketplace-project-resources({uuid: $ctrl.context.project.uuid, category_uuid: '${category.uuid}'})`,
          countFieldKey: `marketplace_category_${category.uuid}`,
        }));
        return [
          {
            label: gettext('Resources'),
            link: 'project.resources',
            icon: 'fa-files-o',
            index: 300,
            children
          }
        ];
      });
    } else {
      return [];
    }
  });

  SidebarExtensionService.register('customer', () => {
    return [
      {
        key: 'marketplace',
        icon: 'fa-shopping-cart',
        label: gettext('Marketplace'),
        feature: 'marketplace',
        link: 'marketplace-landing-customer({uuid: $ctrl.context.customer.uuid})',
        index: 210,
      },
    ];
  });
}

import { getCategories } from '@waldur/marketplace/common/api';

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService, currentStateService, features) {
  SidebarExtensionService.register('customer', () => {
    let items = [
      {
        key: 'marketplace',
        icon: 'fa-shopping-cart',
        label: gettext('Marketplace'),
        feature: 'marketplace',
        link: 'marketplace-landing-customer({uuid: $ctrl.context.customer.uuid})',
        index: 210,
      },
    ];

    return currentStateService.getCustomer().then(customer => {
      if (customer && customer.is_service_provider) {
        return [
          ...items,
          {
            label: gettext('My services'),
            icon: 'fa-shopping-cart',
            feature: 'marketplace',
            link: 'marketplace-services',
            index: 310,
            children: [
              {
                label: gettext('My offerings'),
                icon: 'fa-file',
                link: 'marketplace-my-offerings({uuid: $ctrl.context.customer.uuid})',
                feature: 'marketplace.my-offerings',
              },
              {
                key: 'marketplace',
                icon: 'fa-file',
                label: gettext('My orders'),
                link: 'marketplace-my-order-items({uuid: $ctrl.context.customer.uuid})',
              },
              {
                icon: 'fa-file',
                label: gettext('My resources'),
                link: 'marketplace-customer-resources({uuid: $ctrl.context.customer.uuid})',
              },
              {
                label: gettext('Public offerings'),
                icon: 'fa-money',
                link: 'marketplace-vendor-offerings({uuid: $ctrl.context.customer.uuid})',
              },
              {
                key: 'marketplace',
                icon: 'fa-money',
                label: gettext('Public orders'),
                link: 'marketplace-order-items({uuid: $ctrl.context.customer.uuid})',
              },
              {
                icon: 'fa-money',
                label: gettext('Public resources'),
                link: 'marketplace-public-resources({uuid: $ctrl.context.customer.uuid})',
              },
            ]
          }
        ];
      } else {
        return [
          ...items,
          {
            label: gettext('My services'),
            icon: 'fa-shopping-cart',
            feature: 'marketplace',
            link: 'marketplace-services',
            index: 310,
            children: [
              {
                label: gettext('My offerings'),
                icon: 'fa-file',
                link: 'marketplace-my-offerings({uuid: $ctrl.context.customer.uuid})',
                feature: 'marketplace.my-offerings',
              },
              {
                icon: 'fa-file',
                label: gettext('My resources'),
                link: 'marketplace-customer-resources({uuid: $ctrl.context.customer.uuid})',
              },
              {
                key: 'marketplace',
                icon: 'fa-file',
                label: gettext('My orders'),
                link: 'marketplace-my-order-items({uuid: $ctrl.context.customer.uuid})',
              },
            ]
          }
        ];
      }
    });
  });

  SidebarExtensionService.register('project', () => {
    let items = [
      {
        key: 'marketplace',
        icon: 'fa-shopping-cart',
        label: gettext('Marketplace'),
        feature: 'marketplace',
        link: 'marketplace-landing({uuid: $ctrl.context.project.uuid})',
        index: 210,
      },
      {
        label: gettext('My orders'),
        icon: 'fa-folder-open',
        link: 'marketplace-order-list({uuid: $ctrl.context.project.uuid})',
        feature: 'marketplace',
        index: 220,
      }
    ];

    if (features.isVisible('marketplace')) {
      return getCategories({params: {field: ['uuid', 'title']}}).then(categories => {
        const children = categories.map(category => ({
          label: category.title,
          icon: 'fa-cloud',
          link: `marketplace-project-resources({uuid: $ctrl.context.project.uuid, category_uuid: '${category.uuid}'})`,
          countFieldKey: `marketplace_category_${category.uuid}`,
        }));
        return [
          ...items,
          {
            label: gettext('Resources'),
            link: 'marketplace-resources',
            icon: 'fa-files-o',
            index: 300,
            children
          }
        ];
      });
    } else {
      return items;
    }
  });
}

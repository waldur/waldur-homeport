import ipRegex from 'ip-regex';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useExtraTabs } from '@waldur/navigation/context';
import { useOfferingCategories } from '@waldur/navigation/sidebar/utils';
import { Tab } from '@waldur/navigation/Tab';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { getUser } from '@waldur/workspace/selectors';

import { getCategoryItems } from './category/utils';

export const formatResourceShort = (resource) => {
  return (
    (resource.name ? resource.name : resource.uuid) +
    ' (' +
    resource.offering_name +
    ')'
  );
};

export const isExperimentalUiComponentsVisible = () =>
  isFeatureVisible(MarketplaceFeatures.show_experimental_ui_components);

const IPv4_ADDRESS_PATTERN = ipRegex.v4({ exact: true });
const IPv6_ADDRESS_PATTERN = ipRegex.v6({ exact: true });

export const validateIP = (value) => {
  if (!value) return false;
  return IPv4_ADDRESS_PATTERN.test(value) || IPv6_ADDRESS_PATTERN.test(value);
};

export const useMarketplacePublicTabs = () => {
  const user = useSelector(getUser);
  const categories = useOfferingCategories();

  const tabs = useMemo(() => {
    const _tabs: Tab[] = [
      {
        title: translate('Dashboard'),
        to: 'public.marketplace-landing',
      },
    ];

    const categoryTabs = getCategoryItems(categories || []);

    const additionalTabs: Tab[] = [
      {
        title: translate('Service providers'),
        to: 'public.marketplace-providers',
      },
      !isFeatureVisible(MarketplaceFeatures.catalogue_only) &&
        user && {
          title: translate('Orders'),
          to: 'public.marketplace-orders',
        },
    ].filter(Boolean);

    return _tabs.concat(categoryTabs, additionalTabs);
  }, [categories]);
  useExtraTabs(tabs);
};

export const getOrderBreadcrumbItems = (order): IBreadcrumbItem[] => [
  {
    key: 'marketplace',
    text: translate('Marketplace'),
    to: 'public.marketplace-landing',
  },
  {
    key: 'offerings',
    text: translate('Offerings'),
    to: 'public.offerings',
  },
  {
    key: 'offering',
    text: order.offering_name,
    to: 'public-offering.marketplace-public-offering',
    params: { uuid: order.offering_uuid },
  },
  {
    key: 'resources',
    text: translate('Resources'),
    to: 'all-resources',
    params: {
      offering: JSON.stringify({
        uuid: order.offering_uuid,
        name: order.offering_name,
        category_title: order.category_title,
        thumbnail: order.offering_thumbnail,
      }),
    },
  },
  {
    key: 'resource',
    text: order.resource_name,
    to: 'marketplace-resource-details',
    params: { resource_uuid: order.marketplace_resource_uuid },
  },
  {
    key: 'orders',
    text: translate('Orders'),
    to: 'marketplace-resource-details',
    params: {
      resource_uuid: order.marketplace_resource_uuid,
      tab: 'order-history',
    },
  },
  {
    key: 'order',
    text: order.attributes.name + ' (' + order.type + ')',
    active: true,
  },
];

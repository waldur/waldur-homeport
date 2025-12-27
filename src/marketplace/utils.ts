import ipRegex from 'ip-regex';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useExtraTabs } from '@waldur/navigation/context';
import { useOfferingCategories } from '@waldur/navigation/sidebar/utils';
import { Tab } from '@waldur/navigation/Tab';
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
          to: 'auth-marketplace-orders',
        },
    ].filter(Boolean);

    return _tabs.concat(categoryTabs, additionalTabs);
  }, [categories]);
  useExtraTabs(tabs);
};

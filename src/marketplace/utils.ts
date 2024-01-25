import ipRegex from 'ip-regex';
import { useMemo } from 'react';
import { getFormValues } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { useExtraTabs } from '@waldur/navigation/context';
import { Tab } from '@waldur/navigation/Tab';
import { usePublicCallsLink } from '@waldur/proposals/PublicCallsLink';
import { RootState } from '@waldur/store/reducers';

import { getCategoryItems } from './category/utils';
import { useLandingCategories } from './landing/hooks';
import { useCategoryLink } from './links/CategoryLink';
import { useMarketplaceLandingLink } from './links/LandingLink';

export const formDataSelector = (state: RootState) =>
  (getFormValues(FORM_ID)(state) || {}) as any;

export const formatResourceShort = (resource) => {
  return (
    (resource.name ? resource.name : resource.uuid) +
    ' (' +
    resource.offering_name +
    ')'
  );
};

export const isExperimentalUiComponentsVisible = () =>
  isFeatureVisible('marketplace.show_experimental_ui_components');

const IPv4_ADDRESS_PATTERN = ipRegex.v4({ exact: true });
const IPv6_ADDRESS_PATTERN = ipRegex.v6({ exact: true });

export const validateIP = (value) => {
  if (!value) return false;
  return IPv4_ADDRESS_PATTERN.test(value) || IPv6_ADDRESS_PATTERN.test(value);
};

export const useMarketplacePublicTabs = () => {
  const categories = useLandingCategories();

  const { state: landingState, stateParams: landingStateParams } =
    useMarketplaceLandingLink();
  const callsState = usePublicCallsLink();
  const { state: categoryState } = useCategoryLink();

  const tabs = useMemo(() => {
    const _tabs: Tab[] = [
      {
        title: translate('Dashboard'),
        to: landingState,
        params: landingStateParams,
      },
    ];
    if (isFeatureVisible('marketplace.show_call_management_functionality')) {
      _tabs.push({
        title: translate('Calls'),
        to: callsState,
      });
    }
    return _tabs.concat(
      getCategoryItems(
        categories.isFetched ? categories.data : [],
        categoryState,
      ),
    );
  }, [
    categories.isFetched,
    categories.data,
    categoryState,
    landingState,
    landingStateParams,
    callsState,
  ]);
  useExtraTabs(tabs);
};

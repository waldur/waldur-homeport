import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceCategoriesRetrieve,
  marketplacePublicOfferingsRetrieve,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { getUser } from '@waldur/workspace/selectors';

import { Offering } from '../types';
import { isExperimentalUiComponentsVisible } from '../utils';

import { PUBLIC_OFFERING_DATA_QUERY_KEY } from './constants';
import { OfferingViewHero } from './OfferingViewHero';
import { getPublicOfferingBreadcrumbItems } from './utils';

const PublicOfferingInfo = lazyComponent(() =>
  import('./details/PublicOfferingInfo').then((module) => ({
    default: module.PublicOfferingInfo,
  })),
);
const PublicOfferingComponents = lazyComponent(() =>
  import('./details/PublicOfferingComponents').then((module) => ({
    default: module.PublicOfferingComponents,
  })),
);
const PublicOfferingImages = lazyComponent(() =>
  import('./details/PublicOfferingImages').then((module) => ({
    default: module.PublicOfferingImages,
  })),
);
const PublicOfferingGettingStarted = lazyComponent(() =>
  import('./details/PublicOfferingGettingStarted').then((module) => ({
    default: module.PublicOfferingGettingStarted,
  })),
);
const PublicOfferingFAQ = lazyComponent(() =>
  import('./details/PublicOfferingFAQ').then((module) => ({
    default: module.PublicOfferingFAQ,
  })),
);
const PublicOfferingPricing = lazyComponent(() =>
  import('./details/PublicOfferingPricing').then((module) => ({
    default: module.PublicOfferingPricing,
  })),
);
const PublicOfferingLocation = lazyComponent(() =>
  import('./details/PublicOfferingLocation').then((module) => ({
    default: module.PublicOfferingLocation,
  })),
);
const PublicOfferingGetHelp = lazyComponent(() =>
  import('./details/PublicOfferingGetHelp').then((module) => ({
    default: module.PublicOfferingGetHelp,
  })),
);

const getTabs = (offering?): PageBarTab[] => {
  if (!offering) {
    // Return an empty array or placeholders until the offering is loaded
    return [];
  }
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const showDescriptionTab =
    offering?.full_description ||
    offering?.description ||
    offering?.attributes.length;

  const showGettingStartedTab = offering?.getting_started;

  return [
    showDescriptionTab && {
      title: translate('Description'),
      key: 'description',
      component: PublicOfferingInfo,
    },
    showGettingStartedTab
      ? {
          title: translate('Getting started'),
          key: 'getting-started',
          component: PublicOfferingGettingStarted,
        }
      : null,
    isFeatureVisible(MarketplaceFeatures.catalogue_only) ||
    !offering.plans?.length
      ? null
      : {
          title: translate('Pricing'),
          key: 'pricing',
          component: PublicOfferingPricing,
        },
    isFeatureVisible(MarketplaceFeatures.catalogue_only)
      ? null
      : {
          title: translate('Components'),
          key: 'components',
          component: PublicOfferingComponents,
        },
    offering?.screenshots.length
      ? {
          title: translate('Images'),
          key: 'images',
          component: PublicOfferingImages,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('FAQ'),
          key: 'faq',
          component: PublicOfferingFAQ,
        }
      : null,
    offering.latitude && offering.longitude
      ? {
          title: translate('Location'),
          key: 'location',
          component: PublicOfferingLocation,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('Get help'),
          key: 'get-help',
          component: PublicOfferingGetHelp,
        }
      : null,
  ].filter(Boolean);
};

export const OfferingPublicUIView = () => {
  const dispatch = useDispatch();

  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const user = useSelector(getUser);

  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    queryKey: [PUBLIC_OFFERING_DATA_QUERY_KEY, uuid, user?.uuid],

    queryFn: async () => {
      const options = user ? undefined : { auth: null };
      const offering = (await marketplacePublicOfferingsRetrieve({
        path: { uuid },
        ...options,
      }).then((response) => response.data)) as Offering;
      const category = await marketplaceCategoriesRetrieve({
        path: { uuid: offering.category_uuid },
        ...options,
      }).then((response) => response.data);
      return { offering, category };
    },

    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const tabs = useMemo(() => getTabs(data?.offering), [data]);
  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <OfferingViewHero
      offering={data?.offering}
      refetch={refetch}
      isLoading={isLoading}
      isRefetching={isRefetching}
      error={error}
      isPublic
    />,

    [data?.offering, isRefetching, refetch, error, isLoading],
  );

  const router = useRouter();
  const breadcrumbItems = useMemo(
    () => getPublicOfferingBreadcrumbItems(data?.offering, dispatch, router),
    [data?.offering, dispatch, router],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          data={data}
          isLoading={isLoading}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};

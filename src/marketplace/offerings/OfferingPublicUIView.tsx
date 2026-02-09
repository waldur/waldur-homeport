import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceCategoriesRetrieve,
  marketplaceOfferingTermsOfServiceList,
  marketplacePublicOfferingsRetrieve,
} from 'waldur-js-client';

import { isAuthenticated } from '@waldur/auth/AuthService';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isEmpty } from '@waldur/core/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isValidAttribute } from '@waldur/marketplace/offerings/details/utils';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { getUser } from '@waldur/workspace/selectors';

import { Category, Offering } from '../types';

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
const PublicOfferingSoftwareCatalog = lazyComponent(() =>
  import('./details/PublicOfferingSoftwareCatalog').then((module) => ({
    default: module.PublicOfferingSoftwareCatalog,
  })),
);
const PublicOfferingPartitions = lazyComponent(() =>
  import('./details/PublicOfferingPartitions').then((module) => ({
    default: module.PublicOfferingPartitions,
  })),
);
const PublicOfferingTermsOfService = lazyComponent(() =>
  import('./details/PublicOfferingTermsOfService').then((module) => ({
    default: module.PublicOfferingTermsOfService,
  })),
);

const getTabs = (
  offering?: Offering,
  category?: Category,
  hasActiveTos = false,
): PageBarTab[] => {
  if (!offering) {
    // Return an empty array or placeholders until the offering is loaded
    return [];
  }

  const hasValidAttributes = category
    ? category.sections.length > 0 &&
      !isEmpty(offering.attributes) &&
      category.sections.some((section) =>
        section.attributes.some(
          (attr) =>
            Object.prototype.hasOwnProperty.call(
              offering.attributes,
              attr.key,
            ) && isValidAttribute(offering.attributes[attr.key]),
        ),
      )
    : false;

  const showDescriptionTab =
    offering?.full_description || offering?.description || hasValidAttributes;

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
    isFeatureVisible(
      MarketplaceFeatures.conceal_offering_pricing_tab_in_public_view,
    ) ||
    !offering.plans?.length
      ? null
      : {
          title: translate('Pricing'),
          key: 'pricing',
          component: PublicOfferingPricing,
        },
    isFeatureVisible(MarketplaceFeatures.catalogue_only) ||
    isFeatureVisible(
      MarketplaceFeatures.conceal_offering_pricing_tab_in_public_view,
    )
      ? null
      : {
          title: translate('Components'),
          key: 'components',
          component: PublicOfferingComponents,
        },
    offering?.software_catalogs?.length
      ? {
          title: translate('Software'),
          key: 'software',
          component: PublicOfferingSoftwareCatalog,
        }
      : null,
    isFeatureVisible(MarketplaceFeatures.display_offering_partitions) &&
    offering?.partitions?.length
      ? {
          title: translate('Slurm partitions'),
          key: 'partitions',
          component: PublicOfferingPartitions,
        }
      : null,
    offering?.screenshots.length
      ? {
          title: translate('Images'),
          key: 'images',
          component: PublicOfferingImages,
        }
      : null,
    offering.latitude && offering.longitude
      ? {
          title: translate('Location'),
          key: 'location',
          component: PublicOfferingLocation,
        }
      : null,
    hasActiveTos
      ? {
          title: translate('Terms of Service'),
          key: 'terms-of-service',
          component: PublicOfferingTermsOfService,
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
      // Use isAuthenticated() which checks localStorage token synchronously,
      // rather than user from Redux which may not be loaded yet on page refresh
      const options = isAuthenticated() ? undefined : { auth: null };
      const offering = (await marketplacePublicOfferingsRetrieve({
        path: { uuid },
        ...options,
      }).then((response) => response.data)) as Offering;
      const category = await marketplaceCategoriesRetrieve({
        path: { uuid: offering.category_uuid },
        ...options,
      }).then((response) => response.data);

      // Check if offering has active ToS (only for authenticated users)
      let hasActiveTos = false;
      if (isAuthenticated()) {
        try {
          const tosData = await marketplaceOfferingTermsOfServiceList({
            query: { offering_uuid: offering.uuid, is_active: true },
          }).then((response) => response.data || []);
          hasActiveTos = tosData.length > 0;
        } catch {
          hasActiveTos = false;
        }
      }

      return { offering, category, hasActiveTos };
    },

    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const tabs = useMemo(
    () => getTabs(data?.offering, data?.category, data?.hasActiveTos),
    [data],
  );
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
      render={(Component, { key, ...props }) => {
        // Use tabSpec.component if available (for tab navigation)
        const ComponentToRender = tabSpec?.component || Component;
        return (
          <ComponentToRender
            key={key}
            {...props}
            refetch={refetch}
            data={data}
            isLoading={isLoading}
            error={error}
            tabSpec={tabSpec}
            offering={data?.offering}
            category={data?.category}
          />
        );
      }}
    />
  );
};

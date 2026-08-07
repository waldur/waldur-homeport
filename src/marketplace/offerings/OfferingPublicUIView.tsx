import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import {
  customersList,
  marketplaceCategoriesRetrieve,
  marketplaceOfferingTermsOfServiceList,
  marketplacePublicOfferingsRetrieve,
  Offering,
  proposalMyRequestedResourcesCount,
} from 'waldur-js-client';

import { isAuthenticated } from '@/auth/AuthService';
import { fetchResultCount } from '@/core/api';
import { Badge } from '@/core/Badge';
import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { isEmpty } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { isValidAttribute } from '@/marketplace/offerings/details/utils';
import { useBreadcrumbs, usePageHero } from '@/navigation/context';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { useUser } from '@/workspace/hooks';

import { isProposalRequestEnabled } from '../serviceAccessMode';
import { Category } from '../types';

import { PUBLIC_OFFERING_DATA_QUERY_KEY } from './constants';
import { OfferingViewHero } from './OfferingViewHero';
import { getPublicOfferingBreadcrumbItems } from './utils';

const OfferingResourceRequests = lazyComponent(() =>
  import('@/proposals/requests/OfferingResourceRequests').then((module) => ({
    default: module.OfferingResourceRequests,
  })),
);

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
const PublicOfferingQoS = lazyComponent(() =>
  import('./details/PublicOfferingQoS').then((module) => ({
    default: module.PublicOfferingQoS,
  })),
);
const PublicOfferingDocuments = lazyComponent(() =>
  import('./details/PublicOfferingDocuments').then((module) => ({
    default: module.PublicOfferingDocuments,
  })),
);
const PublicOfferingTermsOfService = lazyComponent(() =>
  import('./details/PublicOfferingTermsOfService').then((module) => ({
    default: module.PublicOfferingTermsOfService,
  })),
);
const PublicOfferingDocumentationAndSupport = lazyComponent(() =>
  import('./details/PublicOfferingDocumentationAndSupport').then((module) => ({
    default: module.PublicOfferingDocumentationAndSupport,
  })),
);

const getTabs = (
  offering?: Offering,
  category?: Category,
  hasActiveTos = false,
  concealPricing = false,
  resourceRequestCount = 0,
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
    concealPricing ||
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
    ) ||
    concealPricing
      ? null
      : {
          title: translate('Components'),
          key: 'components',
          component: PublicOfferingComponents,
        },
    !offering?.files?.length
      ? null
      : {
          title: translate('Documents'),
          key: 'documents',
          component: PublicOfferingDocuments,
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
    isFeatureVisible(MarketplaceFeatures.display_offering_partitions) &&
    offering?.qos_profiles?.length
      ? {
          title: translate('QoS profiles'),
          key: 'qos-profiles',
          component: PublicOfferingQoS,
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
    offering?.documentation_url || offering?.helpdesk_url
      ? {
          title: translate('Documentation & support'),
          key: 'documentation-support',
          component: PublicOfferingDocumentationAndSupport,
        }
      : null,
    // Same gate as the Request button, and only when there is something to
    // show — an always-present empty tab is noise on every other offering.
    isProposalRequestEnabled() && resourceRequestCount > 0
      ? {
          title: (
            <>
              {translate('My requests')}{' '}
              <Badge variant="secondary" pill>
                {resourceRequestCount}
              </Badge>
            </>
          ),
          key: 'my-requests',
          component: OfferingResourceRequests,
        }
      : null,
  ].filter(Boolean);
};

export const OfferingPublicUIView = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const user = useUser();

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
      let concealPricing = false;
      if (isAuthenticated()) {
        try {
          const tosData = await marketplaceOfferingTermsOfServiceList({
            query: { offering_uuid: offering.uuid, is_active: true },
          }).then((response) => response.data || []);
          hasActiveTos = tosData.length > 0;
        } catch {
          hasActiveTos = false;
        }

        // Check if all user's organizations conceal billing info
        try {
          const customers = await customersList({
            query: {
              field: ['uuid', 'display_billing_info_in_projects'],
            },
          }).then((response) => response.data);
          if (customers.length > 0) {
            concealPricing = customers.every(
              (c) => c.display_billing_info_in_projects === false,
            );
          }
        } catch {
          concealPricing = false;
        }
      }

      return { offering, category, hasActiveTos, concealPricing };
    },

    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  // Counts only what this user requested for this offering, so the tab appears
  // exactly when it would have rows. Anonymous visitors never have any.
  const { data: resourceRequestCount } = useQuery({
    queryKey: ['OfferingResourceRequestCount', uuid, user?.uuid],
    queryFn: () =>
      // The count action answers in the X-Result-Count header, not the body.
      proposalMyRequestedResourcesCount({
        query: { offering_uuid: uuid },
      }).then((result) => fetchResultCount(result) || 0),
    enabled: Boolean(user && isProposalRequestEnabled()),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  const tabs = useMemo(
    () =>
      getTabs(
        data?.offering,
        data?.category,
        data?.hasActiveTos,
        data?.concealPricing,
        resourceRequestCount,
      ),
    [data, resourceRequestCount],
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
    () => getPublicOfferingBreadcrumbItems(data?.offering, router),
    [data?.offering, router],
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

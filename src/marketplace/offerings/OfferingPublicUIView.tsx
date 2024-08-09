import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getPlugins,
  getCategories,
  getPublicOffering,
} from '@waldur/marketplace/common/api';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { filterPluginsData } from '@waldur/marketplace/offerings/store/utils';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { getUser } from '@waldur/workspace/selectors';

import { isExperimentalUiComponentsVisible } from '../utils';

import { OfferingViewHero } from './OfferingViewHero';
import { getPublicOfferingBreadcrumbItems } from './utils';

const PublicOfferingGeneral = lazyComponent(
  () => import('./details/PublicOfferingGeneral'),
  'PublicOfferingGeneral',
);
const PublicOfferingInfo = lazyComponent(
  () => import('./details/PublicOfferingInfo'),
  'PublicOfferingInfo',
);
const PublicOfferingComponents = lazyComponent(
  () => import('./details/PublicOfferingComponents'),
  'PublicOfferingComponents',
);
const PublicOfferingImages = lazyComponent(
  () => import('./details/PublicOfferingImages'),
  'PublicOfferingImages',
);
const PublicOfferingGettingStarted = lazyComponent(
  () => import('./details/PublicOfferingGettingStarted'),
  'PublicOfferingGettingStarted',
);
const PublicOfferingFAQ = lazyComponent(
  () => import('./details/PublicOfferingFAQ'),
  'PublicOfferingFAQ',
);
const PublicOfferingReviews = lazyComponent(
  () => import('./details/PublicOfferingReviews'),
  'PublicOfferingReviews',
);
const PublicOfferingPricing = lazyComponent(
  () => import('./details/PublicOfferingPricing'),
  'PublicOfferingPricing',
);
const PublicOfferingFacility = lazyComponent(
  () => import('./details/PublicOfferingFacility'),
  'PublicOfferingFacility',
);
const PublicOfferingGetHelp = lazyComponent(
  () => import('./details/PublicOfferingGetHelp'),
  'PublicOfferingGetHelp',
);

const getTabs = (offering?): PageBarTab[] => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return [
    {
      title: translate('General'),
      key: 'general',
      component: PublicOfferingGeneral,
    },
    {
      title: translate('Description'),
      key: 'description',
      component: PublicOfferingInfo,
    },
    {
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
          title: translate('Getting started'),
          key: 'getting-started',
          component: PublicOfferingGettingStarted,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('FAQ'),
          key: 'faq',
          component: PublicOfferingFAQ,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('Reviews'),
          key: 'reviews',
          component: PublicOfferingReviews,
        }
      : null,
    {
      title: translate('Pricing'),
      key: 'pricing',
      component: PublicOfferingPricing,
    },
    {
      title: translate('Facility'),
      key: 'facility',
      component: PublicOfferingFacility,
    },
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

  const { isLoading, error, data, refetch, isRefetching } = useQuery(
    ['publicOfferingData', uuid, user?.uuid],
    async () => {
      if (user) {
        const offering = await getPublicOffering(uuid);
        const category = await getCategory(offering.category_uuid);
        const categories = await getCategories();
        const pluginsData = await getPlugins();
        const plugins = filterPluginsData(pluginsData);
        dispatch(
          actions.loadDataSuccess({
            offering,
            categories,
            plugins,
          }),
        );
        return { offering, category };
      } else {
        const offering = await getPublicOffering(uuid, ANONYMOUS_CONFIG);
        const category = await getCategory(
          offering.category_uuid,
          ANONYMOUS_CONFIG,
        );
        const categories = await getCategories(ANONYMOUS_CONFIG);
        dispatch(
          actions.loadDataSuccess({
            offering,
            categories,
          }),
        );
        return { offering, category };
      }
    },
    { refetchOnWindowFocus: false, staleTime: 3 * 60 * 1000 },
  );

  const tabs = useMemo(() => getTabs(data?.offering), [data]);
  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <OfferingViewHero
      offeringUuid={uuid}
      refetch={refetch}
      isRefetching={isRefetching}
      isPublic
    />,
    [uuid, isRefetching, refetch],
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
          {...props}
          key={key}
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

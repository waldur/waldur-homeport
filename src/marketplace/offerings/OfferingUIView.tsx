import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import {
  marketplaceCategoriesRetrieve,
  marketplaceProviderOfferingsRetrieve,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { useBreadcrumbs, usePageHero } from '@/navigation/context';

import { PROVIDER_OFFERING_DATA_QUERY_KEY } from './constants';
import { getOfferingBreadcrumbItems } from './hooks';
import { OfferingViewHero } from './OfferingViewHero';

const loadOfferingData = async (offering_uuid: string) => {
  const offering = await marketplaceProviderOfferingsRetrieve({
    path: { uuid: offering_uuid },
  }).then((response) => response.data);
  const category = await marketplaceCategoriesRetrieve({
    path: { uuid: offering.category_uuid },
  }).then((response) => response.data);

  return { offering, category };
};

export const OfferingUIView = (props) => {
  const {
    state,
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const {
    isLoading,
    error,
    data: offeringData,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [PROVIDER_OFFERING_DATA_QUERY_KEY, offering_uuid],
    queryFn: () => loadOfferingData(offering_uuid),
    staleTime: UI_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  usePageHero(
    <OfferingViewHero
      offering={offeringData?.offering as any}
      refetch={refetch}
      isRefetching={isRefetching}
      isLoading={isLoading}
      error={error}
    />,
    [offeringData?.offering, refetch, isRefetching, isLoading, error],
  );

  const page = state.name.includes('update') ? 'edit' : 'details';
  const breadcrumbItems = useMemo(
    () =>
      getOfferingBreadcrumbItems(
        offeringData?.offering as any,
        props.provider,
        page,
      ),
    [offeringData?.offering, props.provider, page],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...uiViewProps }) => (
        <Component
          key={key}
          {...props}
          {...uiViewProps}
          offeringData={offeringData}
          refetchOffering={refetch}
          isLoadingOffering={isLoading}
          isRefetchingOffering={isRefetching}
          errorOffering={error}
        />
      )}
    />
  );
};

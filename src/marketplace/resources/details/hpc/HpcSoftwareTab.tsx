import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplacePublicOfferingsRetrieve, Resource } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { PublicOfferingSoftwareCatalogTable } from '@/marketplace/offerings/details/PublicOfferingSoftwareCatalogTable';

/** The allocation's software: the offering's catalog, as its public page shows it. */
export const HpcSoftwareTab: FC<{ resource: Resource }> = ({ resource }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['public-offering', resource.offering_uuid],
    queryFn: () =>
      marketplacePublicOfferingsRetrieve({
        path: { uuid: resource.offering_uuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });
  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <LoadingErred loadData={refetch} />;
  return <PublicOfferingSoftwareCatalogTable offering={data} />;
};

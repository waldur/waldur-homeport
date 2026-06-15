import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';

import { PublicOfferingSoftwareCatalogTable } from './PublicOfferingSoftwareCatalogTable';

interface PublicOfferingSoftwareCatalogProps {
  data?: { offering: Offering };
  isLoading?: boolean;
}

export const PublicOfferingSoftwareCatalog: FunctionComponent<
  PublicOfferingSoftwareCatalogProps
> = ({ data, isLoading }) => {
  if (isLoading || !data?.offering) {
    return <LoadingSpinner />;
  }

  return <PublicOfferingSoftwareCatalogTable offering={data.offering} />;
};

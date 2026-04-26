import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Offering } from '@waldur/marketplace/types';

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

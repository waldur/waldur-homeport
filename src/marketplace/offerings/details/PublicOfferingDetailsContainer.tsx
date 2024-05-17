import { FC } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { PublicOfferingDetails } from '@waldur/marketplace/offerings/details/PublicOfferingDetails';
import { Category, Offering } from '@waldur/marketplace/types';

interface OwnProps {
  data: {
    offering: Offering;
    category: Category;
  };
  refetch;
  isLoading;
  error;
  tabSpec;
}

export const PublicOfferingDetailsContainer: FC<OwnProps> = (props) => {
  const data = props.data;

  return props.isLoading ? (
    <LoadingSpinner />
  ) : props.error ? (
    <h3>{translate('Unable to load offering details.')}</h3>
  ) : data ? (
    <PublicOfferingDetails
      offering={data.offering}
      refreshOffering={props.refetch}
      category={data.category}
      tabSpec={props.tabSpec}
    />
  ) : (
    <InvalidRoutePage />
  );
};

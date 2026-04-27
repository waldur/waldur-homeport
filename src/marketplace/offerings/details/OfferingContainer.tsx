import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Category, Offering } from '@/marketplace/types';

import { OfferingDetails } from './OfferingDetails';

interface OwnProps {
  data: {
    offering: Offering;
    category: Category;
    plansUsage: PlanUsageResponse[];
  };
  refetch;
  isLoading;
  error;
  tabSpec;
}

export const OfferingContainer: FC<OwnProps> = (props) => {
  const data = props.data;

  if (props.isLoading) {
    return <LoadingSpinner />;
  }

  if (props.error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (!data) {
    return null;
  }

  return (
    <OfferingDetails
      offering={data.offering}
      category={data.category}
      plansUsage={data.plansUsage}
      refetch={props.refetch}
      tabSpec={props.tabSpec}
    />
  );
};

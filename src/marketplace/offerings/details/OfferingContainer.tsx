import { FC } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { PlanUsageRow } from '@waldur/reporting/plan-usage/types';

import { OfferingDetails } from './OfferingDetails';

interface OwnProps {
  data: {
    offering: Offering;
    category: Category;
    plansUsage: PlanUsageRow[];
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

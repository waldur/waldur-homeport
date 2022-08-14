import { FunctionComponent } from 'react';

import { Category, Offering } from '@waldur/marketplace/types';

import { PublicOfferingDetailsHeader } from './PublicOfferingDetailsHeader';
import { PublicOfferingInfo } from './PublicOfferingInfo';
import { PublicOfferingLocation } from './PublicOfferingLocation';
import { PublicOfferingPricing } from './PublicOfferingPricing';
import './PublicOfferingDetails.scss';

interface PublicOfferingDetailsProps {
  offering: Offering;
  category: Category;
  refreshOffering;
}

export const PublicOfferingDetails: FunctionComponent<PublicOfferingDetailsProps> =
  ({ offering, category, refreshOffering }) => (
    <div className="publicOfferingDetails m-b">
      <PublicOfferingDetailsHeader
        offering={offering}
        category={category}
        refreshOffering={refreshOffering}
      />
      <PublicOfferingInfo offering={offering} category={category} />
      <PublicOfferingPricing offering={offering} />
      <PublicOfferingLocation offering={offering} />
    </div>
  );

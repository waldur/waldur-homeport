import { FunctionComponent } from 'react';

import { PublicOfferingDetailsBreadcrumbs } from '@waldur/marketplace/offerings/details/PublicOfferingDetailsBreadcrumbs';
import { PublicOfferingDetailsHeader } from '@waldur/marketplace/offerings/details/PublicOfferingDetailsHeader';
import { PublicOfferingInfo } from '@waldur/marketplace/offerings/details/PublicOfferingInfo';
import { PublicOfferingLocation } from '@waldur/marketplace/offerings/details/PublicOfferingLocation';
import { PublicOfferingPricing } from '@waldur/marketplace/offerings/details/PublicOfferingPricing';
import { Category, Offering } from '@waldur/marketplace/types';
import './PublicOfferingDetails.scss';

interface PublicOfferingDetailsProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingDetails: FunctionComponent<PublicOfferingDetailsProps> =
  ({ offering, category }) => (
    <div className="publicOfferingDetails m-b">
      <PublicOfferingDetailsHeader offering={offering} />
      <PublicOfferingDetailsBreadcrumbs offering={offering} />
      <PublicOfferingInfo offering={offering} category={category} />
      <PublicOfferingPricing offering={offering} />
      <PublicOfferingLocation offering={offering} />
    </div>
  );

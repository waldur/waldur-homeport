import { FunctionComponent } from 'react';

import { PublicOfferingAttributes } from '@waldur/marketplace/offerings/details/PublicOfferingAttributes';
import { PublicOfferingDescriptionContainer } from '@waldur/marketplace/offerings/details/PublicOfferingDescriptionContainer';
import { Category, Offering } from '@waldur/marketplace/types';
import './PublicOfferingInfo.scss';

interface PublicOfferingInfoProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingInfo: FunctionComponent<PublicOfferingInfoProps> = ({
  offering,
  category,
}) => (
  <div className="publicOfferingInfo">
    <PublicOfferingDescriptionContainer offering={offering} />
    <PublicOfferingAttributes offering={offering} category={category} />
  </div>
);

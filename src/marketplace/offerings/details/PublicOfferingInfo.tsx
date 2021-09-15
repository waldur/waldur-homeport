import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getBookingOffering } from '@waldur/booking/api';
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
}) => {
  const { value } = useAsync(() => getBookingOffering(offering.uuid), [
    offering,
  ]);
  return (
    <div className="publicOfferingInfo">
      <PublicOfferingDescriptionContainer
        offering={offering}
        category={category}
        googleCalendarLink={
          value?.googlecalendar?.public && value?.googlecalendar?.http_link
            ? value.googlecalendar.http_link
            : null
        }
      />
      <PublicOfferingAttributes
        offering={offering}
        category={category}
        googleCalendarLink={
          value?.googlecalendar?.public && value?.googlecalendar?.http_link
            ? value.googlecalendar.http_link
            : null
        }
      />
    </div>
  );
};

import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import {
  OfferingInfo,
  OfferingsByServiceProvider,
} from '@waldur/marketplace/types';
import './SearchResultItem.scss';

interface SearchResultItemProps {
  item: OfferingsByServiceProvider;
}

export const SearchResultItem: FunctionComponent<SearchResultItemProps> = ({
  item,
}) => (
  <div className="searchResultItem">
    <span className="searchResultItem__name">
      <Link
        state="marketplace-service-provider.details"
        params={{ uuid: item.customer_uuid }}
      >
        {item.customer_name}
      </Link>
    </span>
    <div className="searchResultItem__offerings">
      {item.offerings.map((offering: OfferingInfo, i: number) => (
        <Link
          key={i}
          state="public.marketplace-public-offering"
          params={{ uuid: offering.offering_uuid }}
        >
          {offering.offering_name}
        </Link>
      ))}
    </div>
  </div>
);

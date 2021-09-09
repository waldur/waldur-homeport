import { FunctionComponent } from 'react';

import { LeafletMap } from '@waldur/map/LeafletMap';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingLocation.scss';

interface PublicOfferingLocationProps {
  offering: Offering;
}

export const PublicOfferingLocation: FunctionComponent<PublicOfferingLocationProps> = ({
  offering,
}) =>
  offering.latitude && offering.longitude ? (
    <div className="publicOfferingLocation">
      <LeafletMap latitude={offering.latitude} longitude={offering.longitude} />
    </div>
  ) : null;

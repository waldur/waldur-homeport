import { FunctionComponent } from 'react';
import PlaceholderImage from 'react-simple-svg-placeholder';

import { Offering } from '@waldur/marketplace/types';

interface OfferingLogoProps {
  offering: Offering;
}

export const OfferingLogo: FunctionComponent<OfferingLogoProps> = ({
  offering,
}) =>
  offering.thumbnail ? (
    <img src={offering.thumbnail} height={50} width="auto" />
  ) : (
    <PlaceholderImage
      width={75}
      height={50}
      text={offering.name[0]}
      fontSize={40}
    />
  );

import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';

import { ImagesTab } from '../images/ImagesTab';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingImagesProps {
  offering: Offering;
}

export const PublicOfferingImages: FunctionComponent<
  PublicOfferingImagesProps
> = ({ offering }) => {
  return offering.screenshots.length ? (
    <Card className="card-bordered mb-10" id="images">
      <Card.Body>
        <PublicOfferingCardTitle>{translate('Images')}</PublicOfferingCardTitle>
        <ImagesTab images={offering.screenshots} />
      </Card.Body>
    </Card>
  ) : null;
};

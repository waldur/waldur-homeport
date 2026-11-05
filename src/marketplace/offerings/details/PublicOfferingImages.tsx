import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';

import { ImagesTab } from '../images/ImagesTab';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingImagesProps {
  offering: Offering;
}

export const PublicOfferingImages: FunctionComponent<
  PublicOfferingImagesProps
> = ({ offering }) => {
  return offering.screenshots.length ? (
    <Card bordered className="mb-8" id="images">
      <CardContent>
        <PublicOfferingCardTitle>{translate('Images')}</PublicOfferingCardTitle>
        <ImagesTab images={offering.screenshots} />
      </CardContent>
    </Card>
  ) : null;
};

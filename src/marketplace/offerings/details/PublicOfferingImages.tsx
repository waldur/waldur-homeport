import { FunctionComponent } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';

import { ImagesTab } from '../images/ImagesTab';

interface PublicOfferingImagesProps {
  offering: Offering;
}

export const PublicOfferingImages: FunctionComponent<
  PublicOfferingImagesProps
> = ({ offering }) => {
  return offering.screenshots.length ? (
    <Panel
      title={translate('Images')}
      cardBordered
      className="mb-8"
      id="images"
    >
      <ImagesTab images={offering.screenshots} />
    </Panel>
  ) : null;
};

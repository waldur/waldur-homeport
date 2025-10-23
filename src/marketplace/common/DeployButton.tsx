import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

import { OfferingLink } from '../links/OfferingLink';
import { Offering } from '../types';

export const DeployButton = ({
  offering,
  disabled,
}: {
  offering: Offering;
  disabled?: boolean;
}) =>
  isFeatureVisible(MarketplaceFeatures.catalogue_only) ? null : (
    <OfferingLink
      offering_uuid={offering.uuid}
      buttonVariant="text-primary"
      className="btn-sm"
      disabled={disabled}
    >
      {translate('Add resource')}
    </OfferingLink>
  );

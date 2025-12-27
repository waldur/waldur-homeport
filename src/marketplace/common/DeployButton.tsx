import { useRouter } from '@uirouter/react';
import { Button } from 'react-bootstrap';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

import { Offering } from '../types';

export const DeployButton = ({
  offering,
  disabled,
}: {
  offering: Offering;
  disabled?: boolean;
}) => {
  const router = useRouter();

  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.stateService.go('marketplace-offering-public', {
      offering_uuid: offering.uuid,
    });
  };

  return (
    <Button
      variant="text-primary"
      className="btn-sm"
      disabled={disabled}
      onClick={handleClick}
    >
      {translate('Add resource')}
    </Button>
  );
};

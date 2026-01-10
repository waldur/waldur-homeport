import { useRouter } from '@uirouter/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
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
    <CompactSubmitButton
      submitting={false}
      type="button"
      variant="text-primary"
      disabled={disabled}
      onClick={handleClick}
      label={translate('Add resource')}
    />
  );
};

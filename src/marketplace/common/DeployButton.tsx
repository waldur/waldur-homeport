import { useRouter } from '@uirouter/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermissionOnAnyScope } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

import { Offering } from '../types';

export const DeployButton = ({
  offering,
  disabled,
}: {
  offering: Offering;
  disabled?: boolean;
}) => {
  const router = useRouter();
  const user = useUser();

  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }

  if (!hasPermissionOnAnyScope(user, PermissionEnum.CREATE_ORDER)) {
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

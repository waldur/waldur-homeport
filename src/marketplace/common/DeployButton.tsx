import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermissionOnAnyScope } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

import { Offering } from '../types';

export const DeployButton = ({
  offering,
  disabled,
  disabledReason,
}: {
  offering: Offering;
  disabled?: boolean;
  disabledReason?: string;
}) => {
  const router = useRouter();
  const user = useUser();
  const dispatch = useDispatch();

  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }

  if (user && !hasPermissionOnAnyScope(user, PermissionEnum.CREATE_ORDER)) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Authentication required'),
          translate(
            'Please log in to order a resource. You will be redirected to the login page.',
          ),
          {
            positiveButton: translate('Log in'),
          },
        );
        router.stateService.go('login');
      } catch {
        // User cancelled
      }
      return;
    }
    router.stateService.go('marketplace-offering-public', {
      offering_uuid: offering.uuid,
    });
  };

  return (
    <CompactSubmitButton
      submitting={false}
      type="button"
      variant="text-secondary"
      disabled={disabled}
      onClick={handleClick}
      label={translate('Deploy')}
      disabledReason={disabledReason}
    />
  );
};

import { useRouter } from '@uirouter/react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

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
  const { confirm } = useModal();
  const router = useRouter();
  const user = useUser();

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
        await confirm(
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

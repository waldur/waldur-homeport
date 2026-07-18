import { RocketLaunchIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { Offering } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

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
  const user = useUser();
  const router = useRouter();

  if (user && !hasPermissionOnAnyScope(user, PermissionEnum.CREATE_ORDER)) {
    return null;
  }

  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }

  const handleAnonClick = async () => {
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
  };

  const buttonContent = (
    <>
      <span className="svg-icon svg-icon-2">
        <RocketLaunchIcon weight="bold" />
      </span>
      {translate('Deploy')}
    </>
  );

  return (
    <Tip
      id="tip-deploy"
      label={
        disabledReason ||
        (offering.state === 'Paused' ? offering.paused_reason : null)
      }
      className="order-2 order-sm-1 flex-sm-column-auto flex-root"
    >
      {user ? (
        <Link
          state={disabled ? '' : 'marketplace-offering-public'}
          params={{ offering_uuid: offering.uuid }}
          className={`btn btn-lg btn-primary w-100 ${disabled ? 'disabled' : ''}`}
        >
          {buttonContent}
        </Link>
      ) : (
        <button
          type="button"
          className="btn btn-lg btn-primary w-100"
          onClick={handleAnonClick}
        >
          {buttonContent}
        </button>
      )}
    </Tip>
  );
};

import { RocketLaunchIcon } from '@phosphor-icons/react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
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
}) =>
  isFeatureVisible(MarketplaceFeatures.catalogue_only) ? null : (
    <Tip
      id="tip-deploy"
      label={offering.state === 'Paused' ? offering.paused_reason : null}
      className="order-2 order-sm-1 flex-sm-column-auto flex-root"
    >
      <Link
        state={disabled ? '' : 'marketplace-offering-public'}
        params={{ offering_uuid: offering.uuid }}
        className={`btn btn-primary w-100 ${disabled ? 'disabled' : ''}`}
      >
        <span className="svg-icon svg-icon-2">
          <RocketLaunchIcon weight="bold" />
        </span>
        {translate('Deploy')}
      </Link>
    </Tip>
  );

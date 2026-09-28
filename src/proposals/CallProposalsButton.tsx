import { BaseButton } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { buildCallFilterParam } from '@/proposals/callFilterParam';
import { router } from '@/router';

export const CallProposalsButton = ({ call }) =>
  isFeatureVisible(MarketplaceFeatures.call_only) ? null : (
    <BaseButton
      onClick={() =>
        router.stateService.go('proposals-call-proposals', {
          call: buildCallFilterParam(call),
        })
      }
      variant="tertiary"
      label={translate('My Proposals')}
      size="lg"
    />
  );

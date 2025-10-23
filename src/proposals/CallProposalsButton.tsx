import { Button } from 'react-bootstrap';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';

export const CallProposalsButton = ({ call }) =>
  isFeatureVisible(MarketplaceFeatures.call_only) ? null : (
    <Button
      onClick={() =>
        router.stateService.go('proposals-call-proposals', {
          call: JSON.stringify(call),
        })
      }
      variant="tertiary"
    >
      {translate('My Proposals')}
    </Button>
  );

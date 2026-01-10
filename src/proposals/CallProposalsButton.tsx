import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';

export const CallProposalsButton = ({ call }) =>
  isFeatureVisible(MarketplaceFeatures.call_only) ? null : (
    <SubmitButton
      submitting={false}
      type="button"
      onClick={() =>
        router.stateService.go('proposals-call-proposals', {
          call: JSON.stringify(call),
        })
      }
      variant="tertiary"
      label={translate('My Proposals')}
    />
  );

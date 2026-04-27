import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { router } from '@/router';

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

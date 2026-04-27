import { EyeIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { router } from '@/router';

export const OnboardingVerificationView = ({ row }) => {
  const callback = () => {
    // Navigate to justification details if available, otherwise to verification uuid
    const uuid =
      row.justifications && row.justifications.length > 0
        ? row.justifications[0].uuid
        : row.uuid;
    router.stateService.go('support-onboarding-justification-details', {
      uuid,
    });
  };

  return (
    <ActionItem
      title={translate('View')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};

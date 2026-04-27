import { EyeIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { router } from '@/router';

export const OnboardingJustificationView = ({ row }) => {
  const callback = () => {
    router.stateService.go('support-onboarding-justification-details', {
      uuid: row.uuid,
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

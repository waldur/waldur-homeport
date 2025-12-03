import { EyeIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { router } from '@waldur/router';

export const OnboardingJustificationView = ({ row }) => {
  const callback = () => {
    router.stateService.go('admin-onboarding-justification-details', {
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

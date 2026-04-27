import { FC } from 'react';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { OnboardingJustificationApprove } from './OnboardingJustificationApprove';
import { OnboardingJustificationReject } from './OnboardingJustificationReject';
import { OnboardingJustificationView } from './OnboardingJustificationView';

export const OnboardingJustificationActions: FC<{ row; fetch }> = ({
  row,
  fetch,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        OnboardingJustificationView,
        OnboardingJustificationApprove,
        OnboardingJustificationReject,
      ].filter(Boolean)}
    />
  );
};

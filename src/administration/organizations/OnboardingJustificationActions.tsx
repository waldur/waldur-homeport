import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { OnboardingJustificationApprove } from './OnboardingJustificationApprove';
import { OnboardingJustificationReject } from './OnboardingJustificationReject';

export const OnboardingJustificationActions: FC<{ row; fetch }> = ({
  row,
  fetch,
}) => {
  const isPending = row.validation_decision === 'pending';

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      disabled={!isPending}
      tooltip={
        !isPending
          ? translate('This justification has already been reviewed')
          : undefined
      }
      actions={[
        OnboardingJustificationApprove,
        OnboardingJustificationReject,
      ].filter(Boolean)}
    />
  );
};

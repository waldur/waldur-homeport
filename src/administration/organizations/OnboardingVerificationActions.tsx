import { FC } from 'react';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { OnboardingVerificationCreateCustomer } from './OnboardingVerificationCreateCustomer';
import { OnboardingVerificationDeleteAction } from './OnboardingVerificationDeleteAction';
import { OnboardingVerificationView } from './OnboardingVerificationView';

export const OnboardingVerificationActions: FC<{ row; fetch }> = ({
  row,
  fetch,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        OnboardingVerificationView,
        OnboardingVerificationCreateCustomer,
        OnboardingVerificationDeleteAction,
      ].filter(Boolean)}
    />
  );
};

import { FC } from 'react';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { OnboardingVerificationCreateCustomer } from './OnboardingVerificationCreateCustomer';
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
      ].filter(Boolean)}
    />
  );
};

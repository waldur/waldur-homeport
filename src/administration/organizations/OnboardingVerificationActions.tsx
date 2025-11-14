import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { OnboardingVerificationCreateCustomer } from './OnboardingVerificationCreateCustomer';

export const OnboardingVerificationActions: FC<{ row; fetch }> = ({
  row,
  fetch,
}) => {
  const isVerified = row.status === 'verified';

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      disabled={!isVerified}
      tooltip={
        !isVerified
          ? translate('Only verified companies can be converted to customers')
          : undefined
      }
      actions={[OnboardingVerificationCreateCustomer].filter(Boolean)}
    />
  );
};

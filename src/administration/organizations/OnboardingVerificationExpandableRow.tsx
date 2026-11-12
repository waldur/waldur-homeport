import { FC } from 'react';
import { OnboardingVerification } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

/** Only a verification with an error has anything to expand. */
export const hasVerificationError = (row: OnboardingVerification) =>
  Boolean(row.error_message || row.error_traceback);

export const OnboardingVerificationExpandableRow: FC<{
  row: OnboardingVerification;
}> = ({ row }) => {
  if (!hasVerificationError(row)) {
    return null;
  }

  return (
    <ExpandableContainer asTable>
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('Error code')}
          value={row.error_message}
        />
        <PropertyItem
          label={translate('Traceback')}
          value={row.error_traceback}
        />
      </PropertyList>
    </ExpandableContainer>
  );
};

import { FC } from 'react';
import { OnboardingVerification } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const OnboardingVerificationExpandableRow: FC<{
  row: OnboardingVerification;
}> = ({ row }) => {
  const message = row.error_message;
  const traceback = row.error_traceback;
  if (!message && !traceback) {
    return null;
  }

  return (
    <ExpandableContainer asTable>
      <PropertyList variant="summary">
        <PropertyItem label={translate('Error code')} value={message} />
        <PropertyItem label={translate('Traceback')} value={traceback} />
      </PropertyList>
    </ExpandableContainer>
  );
};

import { FC } from 'react';
import { OnboardingVerification } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
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
    <ExpandableContainer>
      <Field
        label={translate('Error code')}
        value={message}
        isStuck
        labelClass="me-2"
      />
      <Field
        label={translate('Traceback')}
        value={traceback}
        isStuck
        labelClass="me-2"
      />
    </ExpandableContainer>
  );
};

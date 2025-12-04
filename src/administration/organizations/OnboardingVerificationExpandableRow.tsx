import { FC } from 'react';
import { OnboardingVerification } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

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

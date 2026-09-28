import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

export const InvitationButtons = ({ dismiss, closeAcceptingInvitation }) => {
  return (
    <>
      <BaseButton
        variant="primary"
        onClick={closeAcceptingInvitation}
        label={translate('Accept invitation')}
        size="lg"
      />
      <BaseButton
        onClick={dismiss}
        label={translate('Cancel invitation')}
        variant="primary"
        size="lg"
      />
    </>
  );
};

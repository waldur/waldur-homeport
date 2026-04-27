import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

export const InvitationButtons = ({ dismiss, closeAcceptingInvitation }) => {
  return (
    <>
      <SubmitButton
        submitting={false}
        type="button"
        variant="primary"
        onClick={closeAcceptingInvitation}
        label={translate('Accept invitation')}
      />
      <SubmitButton
        submitting={false}
        type="button"
        onClick={dismiss}
        label={translate('Cancel invitation')}
      />
    </>
  );
};

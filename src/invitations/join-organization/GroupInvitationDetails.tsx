import { GroupInvitation } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

export const GroupInvitationDetails = ({
  resolve,
}: {
  resolve: { invitation: GroupInvitation };
}) => {
  return (
    <ModalDialog
      title={translate('Details')}
      footer={
        <CloseDialogButton
          variant="primary"
          label={translate('OK')}
          className="w-[100px]"
        />
      }
    >
      <h6 className="text-secondary">
        {resolve.invitation.scope_type === 'customer'
          ? translate('Organization')
          : resolve.invitation.scope_type === 'project'
            ? translate('Project')
            : resolve.invitation.scope_type}
        :
      </h6>
      <p className="text-quaternary">{resolve.invitation.scope_name}</p>
      {resolve.invitation.custom_text && (
        <>
          <h6 className="text-secondary">{translate('Message')}:</h6>
          <p className="text-quaternary">{resolve.invitation.custom_text}</p>
        </>
      )}
      <h6 className="text-secondary">{translate('Description')}:</h6>
      <p className="text-quaternary">{resolve.invitation.scope_description}</p>
    </ModalDialog>
  );
};

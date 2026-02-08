import { GroupInvitation } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const GroupInvitationDetails = ({
  resolve,
}: {
  resolve: { invitation: GroupInvitation };
}) => {
  return (
    <ModalDialog
      title={translate('Details')}
      closeButton
      footer={
        <CloseDialogButton
          variant="primary"
          label={translate('OK')}
          className="w-100px"
        />
      }
    >
      <h6 className="text-gray-700">
        {resolve.invitation.scope_type === 'customer'
          ? translate('Organization')
          : resolve.invitation.scope_type === 'project'
            ? translate('Project')
            : resolve.invitation.scope_type}
        :
      </h6>
      <p className="text-muted">{resolve.invitation.scope_name}</p>
      {resolve.invitation.custom_text && (
        <>
          <h6 className="text-gray-700">{translate('Message')}:</h6>
          <p className="text-muted">{resolve.invitation.custom_text}</p>
        </>
      )}
      <h6 className="text-gray-700">{translate('Description')}:</h6>
      <p className="text-muted">{resolve.invitation.scope_description}</p>
    </ModalDialog>
  );
};

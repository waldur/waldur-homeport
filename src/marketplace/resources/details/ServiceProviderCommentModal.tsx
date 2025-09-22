import { FC } from 'react';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ServiceProviderCommentModalProps {
  comment: string;
}

export const ServiceProviderCommentModal: FC<
  ServiceProviderCommentModalProps
> = ({ comment }) => {
  return (
    <ModalDialog
      title={translate('Service provider message')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <SafeMarkdown text={comment} />
    </ModalDialog>
  );
};

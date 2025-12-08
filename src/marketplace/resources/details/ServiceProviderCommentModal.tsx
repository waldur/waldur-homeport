import { FC } from 'react';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ServiceProviderCommentModalProps {
  comment: string;
  commentUrl?: string;
}

export const ServiceProviderCommentModal: FC<
  ServiceProviderCommentModalProps
> = ({ comment, commentUrl }) => {
  return (
    <ModalDialog
      title={translate('Service provider message')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {commentUrl && (
        <div className="mb-4">
          <div className="text-gray-700 fw-bold mb-2">
            {translate('Service provider URL')}:
          </div>
          <div className="text-gray-500">
            <a href={commentUrl} target="_blank" rel="noopener noreferrer">
              {commentUrl}
            </a>
          </div>
        </div>
      )}
      <div>
        <div className="text-gray-700 fw-bold mb-2">
          {translate('Comment')}:
        </div>
        <div className="text-gray-500">
          <SafeMarkdown text={comment} />
        </div>
      </div>
    </ModalDialog>
  );
};

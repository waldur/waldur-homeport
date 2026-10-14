import { FC } from 'react';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {commentUrl && (
        <div className="mb-4">
          <div className="text-secondary font-medium mb-2">
            {translate('Service provider URL')}:
          </div>
          <div className="text-quaternary">
            <a href={commentUrl} target="_blank" rel="noopener noreferrer">
              {commentUrl}
            </a>
          </div>
        </div>
      )}
      <div>
        <div className="text-secondary font-medium mb-2">
          {translate('Comment')}:
        </div>
        <div className="text-quaternary">
          <SafeMarkdown text={comment} />
        </div>
      </div>
    </ModalDialog>
  );
};

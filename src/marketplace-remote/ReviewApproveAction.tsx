import { CheckIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

import { ReviewDialog } from './ReviewDialog';

export const ReviewApproveAction = ({ request, refetch, apiMethod }) =>
  request.state === 'pending' ? (
    <DialogActionButton
      title={translate('Approve')}
      iconNode={<CheckIcon weight="bold" />}
      resource={request}
      modalComponent={ReviewDialog}
      extraResolve={{
        refetch,
        apiMethod,
      }}
      actionItem
    />
  ) : null;

import { ProhibitIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { ReviewDialog } from './ReviewDialog';

export const ReviewRejectAction = ({ request, refetch, apiMethod }) =>
  request.state === 'pending' ? (
    <DialogActionButton
      title={translate('Reject')}
      className="text-danger"
      iconNode={<ProhibitIcon weight="bold" />}
      resource={request}
      modalComponent={ReviewDialog}
      extraResolve={{
        refetch,
        apiMethod,
      }}
      actionItem
    />
  ) : null;

import { Prohibit } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { ReviewDialog } from './ReviewDialog';

export const ReviewRejectAction = ({ request, refetch, apiMethod }) =>
  request.state === 'pending' ? (
    <DialogActionButton
      title={translate('Reject')}
      variant="light-danger"
      iconNode={<Prohibit />}
      resource={request}
      modalComponent={ReviewDialog}
      extraResolve={{
        refetch,
        apiMethod,
      }}
      rowAction
      size="sm"
    />
  ) : null;

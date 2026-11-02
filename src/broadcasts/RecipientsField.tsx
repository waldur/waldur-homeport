import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { BaseButton, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { RecipientsListDialog } from './RecipientsListDialog';

export const RecipientsField: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => {
  const { openDialog } = useModal();
  const openRecipientsList = () =>
    openDialog(RecipientsListDialog, {
      resolve: { query: row.query },
      size: 'xl',
    });
  return (
    <PropertyItem label={translate('Recipients')}>
      <p>
        <BaseButton
          variant="text-primary"
          onClick={openRecipientsList}
          label={translate('Show recipients')}
        />
      </p>
    </PropertyItem>
  );
};

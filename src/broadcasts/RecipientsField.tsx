import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Field } from '@/resource/summary';

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
    <Field label={translate('Recipients')} labelCol={5} valueCol={7}>
      <p>
        <button
          className="btn btn-link btn-flush"
          type="button"
          onClick={openRecipientsList}
        >
          {translate('Show recipients')}
        </button>
      </p>
    </Field>
  );
};

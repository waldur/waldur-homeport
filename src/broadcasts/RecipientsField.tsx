import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { RecipientsListDialog } from './RecipientsListDialog';
import { BroadcastResponseData } from './types';

export const RecipientsField: FunctionComponent<{
  row: BroadcastResponseData;
}> = ({ row }) => {
  const dispatch = useDispatch();
  const openRecipientsList = () =>
    dispatch(
      openModalDialog(RecipientsListDialog, {
        resolve: { query: row.query },
        size: 'xl',
      }),
    );
  return (
    <>
      <h4 className="fw-normal">{translate('Recipients')}</h4>
      <p>
        <a className="btn btn-link" onClick={openRecipientsList}>
          {translate('Show recipients')}
        </a>
      </p>
    </>
  );
};

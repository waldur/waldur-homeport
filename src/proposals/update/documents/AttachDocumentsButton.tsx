import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { AttachDocumentsDialog } from '@waldur/proposals/update/documents/AttachDocumentsDialog';
import { ActionButton } from '@waldur/table/ActionButton';

export const AttachDocumentsButton = ({ call, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AttachDocumentsDialog, { resolve: { call, refetch } }),
    );
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add attachments')}
      icon="fa fa-plus"
    />
  );
};

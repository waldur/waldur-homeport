import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const AttachDocumentsDialog = lazyComponent(() =>
  import('./AttachDocumentsDialog').then((module) => ({
    default: module.AttachDocumentsDialog,
  })),
);

export const AttachDocumentsButton = ({ call, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AttachDocumentsDialog, {
        resolve: { call, refetch },
        formId: 'AttachDocumentsDialog',
      }),
    );
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add document')}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

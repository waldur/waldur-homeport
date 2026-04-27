import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

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

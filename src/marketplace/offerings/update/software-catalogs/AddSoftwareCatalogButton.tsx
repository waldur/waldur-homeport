import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const SoftwareCatalogDialog = lazyComponent(() =>
  import('./SoftwareCatalogDialog').then((module) => ({
    default: module.SoftwareCatalogDialog,
  })),
);

export const AddSoftwareCatalogButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(SoftwareCatalogDialog, {
        resolve: { mode: 'add', offering, refetch },
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add software catalog')}
      action={callback}
    />
  );
};

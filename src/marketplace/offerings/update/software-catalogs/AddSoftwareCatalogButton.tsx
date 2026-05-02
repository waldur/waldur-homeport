import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const SoftwareCatalogDialog = lazyComponent(() =>
  import('./SoftwareCatalogDialog').then((module) => ({
    default: module.SoftwareCatalogDialog,
  })),
);

export const AddSoftwareCatalogButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(SoftwareCatalogDialog, {
      resolve: { mode: 'add', offering, refetch },
    });
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add software catalog')}
      action={callback}
    />
  );
};

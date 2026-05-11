import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const AddTosDialog = lazyComponent(() =>
  import('./AddTosDialog').then((module) => ({
    default: module.AddTosDialog,
  })),
);

export const AddTosButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddTosDialog, {
      resolve: { offering, refetch },
    });
  };

  return (
    <ActionButton
      action={callback}
      title={translate('Add Terms of Service')}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

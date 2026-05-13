import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingComponentDialog = lazyComponent(() =>
  import('./OfferingComponentDialog').then((module) => ({
    default: module.OfferingComponentDialog,
  })),
);

export const AddComponentButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(OfferingComponentDialog, {
      resolve: { offering, refetch },
    });
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add component')}
      action={callback}
    />
  );
};

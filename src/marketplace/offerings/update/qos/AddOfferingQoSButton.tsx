import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingQoSFormDialog = lazyComponent(() =>
  import('./OfferingQoSFormDialog').then((module) => ({
    default: module.OfferingQoSFormDialog,
  })),
);

export const AddOfferingQoSButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(OfferingQoSFormDialog, {
      resolve: { offering, refetch },
    });
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add QoS profile')}
      action={callback}
    />
  );
};

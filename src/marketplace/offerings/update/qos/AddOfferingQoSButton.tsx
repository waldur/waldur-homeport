import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add QoS profile')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};

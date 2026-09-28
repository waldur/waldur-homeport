import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add component')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};

import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add software catalog')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};

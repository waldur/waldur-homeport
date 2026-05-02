import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const HPACreateDialog = lazyComponent(() =>
  import('./HPACreateDialog').then((module) => ({
    default: module.HPACreateDialog,
  })),
);

export const HPACreateButton: FunctionComponent<{
  cluster: RancherCluster;
}> = ({ cluster }) => {
  const { openDialog } = useModal();
  const callback = () => openDialog(HPACreateDialog, { resolve: { cluster } });
  return (
    <ActionButton
      title={translate('Create')}
      action={callback}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

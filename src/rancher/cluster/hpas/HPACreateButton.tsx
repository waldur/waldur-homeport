import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Create')}
      onClick={callback}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};

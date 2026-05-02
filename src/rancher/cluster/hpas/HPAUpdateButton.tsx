import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const HPAUpdateDialog = lazyComponent(() =>
  import('./HPAUpdateDialog').then((module) => ({
    default: module.HPAUpdateDialog,
  })),
);

export const HPAUpdateButton: FunctionComponent<{ hpa }> = ({ hpa }) => {
  const { openDialog } = useModal();
  const callback = () => openDialog(HPAUpdateDialog, { resolve: { hpa } });
  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

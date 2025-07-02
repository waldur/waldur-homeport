import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const HPAUpdateDialog = lazyComponent(() =>
  import('./HPAUpdateDialog').then((module) => ({
    default: module.HPAUpdateDialog,
  })),
);

const editHPADialog = (hpa) =>
  openModalDialog(HPAUpdateDialog, { resolve: { hpa } });

export const HPAUpdateButton: FunctionComponent<{ hpa }> = ({ hpa }) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(editHPADialog(hpa));
  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

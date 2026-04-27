import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { RancherCluster } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const HPACreateDialog = lazyComponent(() =>
  import('./HPACreateDialog').then((module) => ({
    default: module.HPACreateDialog,
  })),
);

const createHPADialog = (cluster) =>
  openModalDialog(HPACreateDialog, { resolve: { cluster } });

export const HPACreateButton: FunctionComponent<{
  cluster: RancherCluster;
}> = ({ cluster }) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(createHPADialog(cluster));
  return (
    <ActionButton
      title={translate('Create')}
      action={callback}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};

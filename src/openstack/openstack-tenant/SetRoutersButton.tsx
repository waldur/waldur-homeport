import { PencilSimpleIcon } from '@phosphor-icons/react';
import { OpenStackRouter } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

const SetRoutesDialog = lazyComponent(() =>
  import('./SetRoutesDialog').then((module) => ({
    default: module.SetRoutesDialog,
  })),
);

export const SetRoutersButton: ActionItemType<OpenStackRouter> = ({
  resource,
}) => {
  const { openDialog: openModal } = useModal();
  const openDialog = () =>
    openModal(SetRoutesDialog, {
      resolve: {
        router: resource,
      },
    });
  return (
    <ActionItem
      title={translate('Set static routes')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openDialog}
    />
  );
};

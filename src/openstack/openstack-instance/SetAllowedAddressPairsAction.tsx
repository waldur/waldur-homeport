import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import type { AllowedAddressPairsPort } from './SetAllowedAddressPairsDialog';

const SetAllowedAddressPairsDialog = lazyComponent(() =>
  import('./SetAllowedAddressPairsDialog').then((module) => ({
    default: module.SetAllowedAddressPairsDialog,
  })),
);

export const SetAllowedAddressPairsAction: FunctionComponent<{
  resource: AllowedAddressPairsPort;
  instance?: OpenStackInstance;
  refetch?: () => void;
}> = ({ resource, instance, refetch }) => {
  const { openDialog: openModal } = useModal();
  const openDialog = () =>
    openModal(SetAllowedAddressPairsDialog, {
      resolve: {
        instance,
        port: resource,
        refetch,
      },
      size: 'lg',
    });
  return (
    <ActionItem
      title={translate('Set allowed address pairs')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openDialog}
    />
  );
};

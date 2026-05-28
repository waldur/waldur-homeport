import { GlobeIcon } from '@phosphor-icons/react';
import { OpenStackRouter } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

const SetExternalGatewayDialog = lazyComponent(() =>
  import('./SetExternalGatewayDialog').then((module) => ({
    default: module.SetExternalGatewayDialog,
  })),
);

export const SetExternalGatewayButton: ActionItemType<OpenStackRouter> = ({
  resource,
  refetch,
}) => {
  const { openDialog: openModal } = useModal();
  const openDialog = () =>
    openModal(SetExternalGatewayDialog, {
      resolve: {
        router: resource,
        refetch,
      },
    });
  return (
    <ActionItem
      title={
        resource.has_external_gateway
          ? translate('Edit external gateway')
          : translate('Set external gateway')
      }
      iconNode={<GlobeIcon weight="bold" />}
      action={openDialog}
    />
  );
};

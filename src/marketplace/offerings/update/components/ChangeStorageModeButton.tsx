import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { STORAGE_MODE_OPTIONS } from '@waldur/openstack/constants';
import { ActionButton } from '@waldur/table/ActionButton';

import { OfferingSectionProps } from '../types';

const ChangeStorageModeDialog = lazyComponent(() =>
  import('./ChangeStorageModeDialog').then((module) => ({
    default: module.ChangeStorageModeDialog,
  })),
);

export const ChangeStorageModeButton: FC<OfferingSectionProps> = (props) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      iconNode={<PencilSimpleIcon />}
      title={translate('Change storage mode')}
      action={() => {
        openDialog(ChangeStorageModeDialog, {
          resolve: {
            offering: props.offering,
            refetch: props.refetch,
            currentMode: props.offering.plugin_options?.storage_mode || 'fixed',
            modes: STORAGE_MODE_OPTIONS,
          },
        });
      }}
    />
  );
};

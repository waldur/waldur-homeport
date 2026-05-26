import { DatabaseIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { STORAGE_MODE_OPTIONS, TENANT_TYPE } from '@/openstack/constants';
import { ActionItem } from '@/resource/actions/ActionItem';

import { OfferingSectionProps } from '../types';

const ChangeStorageModeDialog = lazyComponent(() =>
  import('./ChangeStorageModeDialog').then((module) => ({
    default: module.ChangeStorageModeDialog,
  })),
);

export const ChangeStorageModeAction: FC<OfferingSectionProps> = ({
  offering,
  refetch,
}) => {
  const { openDialog } = useModal();
  const isOpenStack = offering.type === TENANT_TYPE;

  if (!isOpenStack) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Storage mode')}
      iconNode={<DatabaseIcon weight="bold" />}
      action={() => {
        openDialog(ChangeStorageModeDialog, {
          resolve: {
            offering,
            refetch,
            currentMode: offering.plugin_options?.storage_mode || 'fixed',
            modes: STORAGE_MODE_OPTIONS,
          },
        });
      }}
    />
  );
};

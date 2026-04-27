import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

import { TenantActionProps } from './actions/types';

const MigrateTenantDialog = lazyComponent(() =>
  import('./actions/MigrateTenantDialog').then((module) => ({
    default: module.MigrateTenantDialog,
  })),
);

export const CreateMigrationButton: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusIcon weight="bold" />}
    modalComponent={MigrateTenantDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);

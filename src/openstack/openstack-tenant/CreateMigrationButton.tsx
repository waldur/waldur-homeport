import { Plus } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './actions/types';

const MigrateTenantDialog = lazyComponent(
  () => import('./actions/MigrateTenantDialog'),
  'MigrateTenantDialog',
);

export const CreateMigrationButton: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<Plus />}
    modalComponent={MigrateTenantDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);

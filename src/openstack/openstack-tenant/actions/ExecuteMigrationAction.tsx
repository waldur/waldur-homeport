import { Airplane } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { runMigration } from '@waldur/openstack/api';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';

import { TenantActionProps } from './types';

export const ExecuteMigrationAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionButton
    title={translate('Execute')}
    iconNode={<Airplane />}
    resource={resource}
    apiMethod={runMigration}
    refetch={refetch}
  />
);

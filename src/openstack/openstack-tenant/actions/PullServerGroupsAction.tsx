import { ArrowsClockwise } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { pullTenantServerGroups } from '@waldur/openstack/api';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';
import { validateState } from '@waldur/resource/actions/base';

import { TenantActionProps } from './types';

const validators = [validateState('OK')];

export const PullServerGroupsAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionButton
    title={translate('Synchronise')}
    iconNode={<ArrowsClockwise />}
    resource={resource}
    validators={validators}
    apiMethod={pullTenantServerGroups}
    refetch={refetch}
  />
);

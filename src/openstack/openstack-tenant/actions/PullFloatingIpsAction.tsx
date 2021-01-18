import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { pullTenantFloatingIps } from '@waldur/openstack/api';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';
import { validateState } from '@waldur/resource/actions/base';

import { TenantActionProps } from './types';

const validators = [validateState('OK')];

export const PullFloatingIpsAction: FC<TenantActionProps> = ({ resource }) => (
  <AsyncActionButton
    title={translate('Synchronise')}
    icon="fa fa-refresh"
    resource={resource}
    validators={validators}
    apiMethod={pullTenantFloatingIps}
  />
);

import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackTenantsPullFloatingIps } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionButton } from '@/resource/actions/AsyncActionButton';
import { validateState } from '@/resource/actions/base';

import { TenantActionProps } from './types';

const validators = [validateState('OK')];

export const PullFloatingIpsAction: FC<TenantActionProps> = ({ resource }) => (
  <AsyncActionButton
    title={translate('Synchronise')}
    iconNode={<ArrowsClockwiseIcon weight="bold" />}
    resource={resource}
    validators={validators}
    apiMethod={(uuid) => openstackTenantsPullFloatingIps({ path: { uuid } })}
  />
);

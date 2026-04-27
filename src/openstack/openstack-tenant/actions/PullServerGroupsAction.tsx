import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackTenantsPullServerGroups } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionButton } from '@/resource/actions/AsyncActionButton';
import { validateState } from '@/resource/actions/base';

import { TenantActionProps } from './types';

const validators = [validateState('OK')];

export const PullServerGroupsAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionButton
    title={translate('Synchronise')}
    iconNode={<ArrowsClockwiseIcon weight="bold" />}
    resource={resource}
    validators={validators}
    apiMethod={(uuid) => openstackTenantsPullServerGroups({ path: { uuid } })}
    refetch={refetch}
  />
);

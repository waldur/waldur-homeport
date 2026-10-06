import { PlugsConnectedIcon } from '@phosphor-icons/react';
import { openstackSubnetsConnect } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionItem } from '@/resource/actions/AsyncActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';

import { validateSubnetOwnerAction } from './validators';

const validators = [validateState('OK'), validateSubnetOwnerAction];

export const ConnectSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Connect subnet')}
    apiMethod={(uuid: string) => openstackSubnetsConnect({ path: { uuid } })}
    resource={resource}
    validators={validators}
    refetch={refetch}
    iconNode={<PlugsConnectedIcon weight="bold" />}
  />
);

import { PlugsIcon } from '@phosphor-icons/react';
import { openstackSubnetsDisconnect } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionItem } from '@/resource/actions/AsyncActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';

export const DisconnectSubnetAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <AsyncActionItem
    title={translate('Disconnect subnet')}
    apiMethod={(uuid: string) => openstackSubnetsDisconnect({ path: { uuid } })}
    resource={resource}
    validators={[validateState('OK')]}
    refetch={refetch}
    iconNode={<PlugsIcon weight="bold" />}
  />
);

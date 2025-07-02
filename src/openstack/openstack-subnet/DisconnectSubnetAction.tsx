import { PlugsIcon } from '@phosphor-icons/react';
import { openstackSubnetsDisconnect } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

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

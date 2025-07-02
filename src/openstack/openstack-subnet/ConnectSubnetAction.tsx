import { PlugsConnectedIcon } from '@phosphor-icons/react';
import { openstackSubnetsConnect } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

export const ConnectSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Connect subnet')}
    apiMethod={(uuid: string) => openstackSubnetsConnect({ path: { uuid } })}
    resource={resource}
    validators={[validateState('OK')]}
    refetch={refetch}
    iconNode={<PlugsConnectedIcon weight="bold" />}
  />
);

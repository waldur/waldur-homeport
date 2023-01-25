import { translate } from '@waldur/i18n';
import { connectSubnet } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

export const ConnectSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Connect subnet')}
    apiMethod={connectSubnet}
    resource={resource}
    validators={[validateState('OK')]}
    refetch={refetch}
  />
);

import { translate } from '@waldur/i18n';
import { disconnectSubnet } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { validateState } from '@waldur/resource/actions/base';

export const DisconnectSubnetAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Disconnect subnet')}
    apiMethod={disconnectSubnet}
    resource={resource}
    validators={[validateState('OK')]}
  />
);

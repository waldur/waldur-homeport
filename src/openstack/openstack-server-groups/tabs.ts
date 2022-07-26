import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const ServerGroupMemberList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ServerGroupMemberList" */ '../openstack-server-groups/ServerGroupMemberList'
    ),
  'ServerGroupMemberList',
);

ResourceTabsConfiguration.register('OpenStack.ServerGroup', () => [
  {
    key: 'members',
    title: translate('Members'),
    component: ServerGroupMemberList,
  },
  getEventsTab(),
]);

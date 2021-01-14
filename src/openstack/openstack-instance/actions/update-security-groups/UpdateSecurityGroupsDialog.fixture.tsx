import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { actWait, updateWrapper } from '@waldur/core/testUtils';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

import { UpdateSecurityGroupsDialog } from './UpdateSecurityGroupsDialog';

export const fakeSecurityGroups = ([
  {
    url:
      '/api/openstacktenant-security-groups/fce1fed2b8dd40b8b98252c4df76007f/',
    name: 'SSH',
  },
  {
    url:
      '/api/openstacktenant-security-groups/5bf390b13f194a1fa3fd397631eaac19/',
    name: 'Default',
  },
] as unknown) as SecurityGroup[];

export const fakeInstance = ({
  name: 'backup',
  uuid: 'bcbb973635754084a5b292ecb2274e33',
  service_settings_uuid: 'a500a20d8f7040eabb9e0103d5f119af',
  security_groups: fakeSecurityGroups,
} as unknown) as OpenStackInstance;

type DialogWrapperType = ReactWrapper<typeof UpdateSecurityGroupsDialog>;

export class DialogFixture {
  store: Store;
  instance: OpenStackInstance;
  wrapper: DialogWrapperType;

  constructor(store: Store, instance: OpenStackInstance = fakeInstance) {
    this.store = store;
    this.instance = instance;
  }

  async render() {
    this.wrapper = mount<typeof UpdateSecurityGroupsDialog>(
      <Provider store={this.store}>
        <UpdateSecurityGroupsDialog resolve={{ resource: this.instance }} />
      </Provider>,
    );
    await actWait();
  }

  async update() {
    await updateWrapper(this.wrapper);
  }

  submitForm() {
    this.wrapper.find('form').simulate('submit');
  }
}

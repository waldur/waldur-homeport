import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import {
  actWait,
  findButtonByText,
  updateWrapper,
} from '@waldur/core/testUtils';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';

import { OpenStackTenant } from '../types';

import { CreateSecurityGroupDialog } from './CreateSecurityGroupDialog';

export const fakeTenant = ({
  name: 'VPC',
  url: '/api/openstack-tenants/2bfc029827bb41e884ff60f4b8eff3b2/',
  uuid: '2bfc029827bb41e884ff60f4b8eff3b2',
} as unknown) as OpenStackTenant;

export const defaultSecurityGroup = ({
  url: '/api/openstack-security-groups/c4d9e3ece3be48ddb6dcf86c81b695de/',
  uuid: 'c4d9e3ece3be48ddb6dcf86c81b695de',
  name: 'default',
  settings: '/api/service-settings/671f2f1f45f146cfb94a5ab1d0506162/',
  description: 'Default security group',
} as unknown) as SecurityGroup;

type DialogWrapperType = ReactWrapper<typeof CreateSecurityGroupDialog>;

export class DialogFixture {
  store: Store;
  tenant: OpenStackTenant;
  wrapper: DialogWrapperType;

  constructor(store: Store, tenant: OpenStackTenant = fakeTenant) {
    this.store = store;
    this.tenant = tenant;
  }

  async render() {
    this.wrapper = mount<typeof CreateSecurityGroupDialog>(
      <Provider store={this.store}>
        <CreateSecurityGroupDialog resolve={{ resource: this.tenant }} />
      </Provider>,
    );
    await actWait();
  }

  async update() {
    await updateWrapper(this.wrapper);
  }

  addRule() {
    findButtonByText(this.wrapper, 'Add rule').simulate('click');
  }

  set name(value) {
    this.wrapper.find('input').at(0).simulate('change', { target: { value } });
  }

  set description(value) {
    this.wrapper.find('input').at(1).simulate('change', { target: { value } });
  }

  submitForm() {
    this.wrapper.find('form').simulate('submit');
  }
}

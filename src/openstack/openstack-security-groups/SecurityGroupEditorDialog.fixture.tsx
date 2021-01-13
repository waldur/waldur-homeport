import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  actWait,
  findButtonByText,
  updateWrapper,
} from '@waldur/core/testUtils';

import { SecurityGroupEditorDialog } from './SecurityGroupEditorDialog';
import { SecurityGroup } from './types';

export const fakeSecurityGroup = {
  url: '/api/openstack-security-groups/b40968a448034febbf04c195aafbb4e2/',
  uuid: 'b40968a448034febbf04c195aafbb4e2',
  name: 'http',
  settings: '/api/service-settings/671f2f1f45f146cfb94a5ab1d0506162/',
  description: 'Security group for HTTP',
  rules: [
    {
      to_port: 80,
      cidr: '192.168.42.0/24',
      from_port: 80,
      protocol: 'tcp',
      ethertype: 'IPv4',
      direction: 'egress',
    },
  ],
  tenant: '/api/openstack-tenants/2bfc029827bb41e884ff60f4b8eff3b2/',
} as SecurityGroup;

export const defaultSecurityGroup = ({
  url: '/api/openstack-security-groups/c4d9e3ece3be48ddb6dcf86c81b695de/',
  uuid: 'c4d9e3ece3be48ddb6dcf86c81b695de',
  name: 'default',
  settings: '/api/service-settings/671f2f1f45f146cfb94a5ab1d0506162/',
  description: 'Default security group',
  rules: [
    {
      to_port: -1,
      cidr: '0.0.0.0/0',
      from_port: -1,
      protocol: '',
    },
    {
      to_port: -1,
      cidr: '0.0.0.0/0',
      from_port: -1,
      protocol: '',
    },
  ],
} as unknown) as SecurityGroup;

type DialogWrapperType = ReactWrapper<typeof SecurityGroupEditorDialog>;

export class DialogFixture {
  store: Store;
  securityGroup: SecurityGroup;
  wrapper: DialogWrapperType;

  constructor(store: Store, securityGroup: SecurityGroup = fakeSecurityGroup) {
    this.store = store;
    this.securityGroup = securityGroup;
  }

  async render() {
    this.wrapper = mount<typeof SecurityGroupEditorDialog>(
      <Provider store={this.store}>
        <SecurityGroupEditorDialog resolve={{ resource: this.securityGroup }} />
      </Provider>,
    );
    await actWait();
  }

  async update() {
    await updateWrapper(this.wrapper);
  }

  get modalTitle() {
    return this.wrapper.find('.modal-title').text();
  }

  get modalBody() {
    return this.wrapper.find('.modal-body').text();
  }

  get hasSpinner() {
    return this.wrapper.find(LoadingSpinner).length === 1;
  }

  get submitButton() {
    return findButtonByText(this.wrapper, 'Submit');
  }

  addRule() {
    findButtonByText(this.wrapper, 'Add rule').simulate('click');
  }

  deleteRule() {
    findButtonByText(this.wrapper, 'Delete').simulate('click');
  }

  get tbody() {
    return this.wrapper.find('tbody').text();
  }

  get ethertype() {
    return this.wrapper.find('select').at(0).props().value;
  }

  set ethertype(value) {
    this.wrapper.find('select').at(0).simulate('change', { target: { value } });
  }

  get direction() {
    return this.wrapper.find('select').at(1).props().value;
  }

  get protocol() {
    return this.wrapper.find('select').at(2).props().value;
  }

  set protocol(value) {
    this.wrapper.find('select').at(2).simulate('change', {
      target: {
        value,
      },
    });
  }

  get remoteGroup() {
    return this.wrapper.find('select').at(3).props().value;
  }

  set remoteGroup(value) {
    this.wrapper.find('select').at(3).simulate('change', {
      target: {
        value,
      },
    });
  }

  get fromPort() {
    return this.wrapper.find('input').at(0).props().value;
  }

  set fromPort(value) {
    this.wrapper.find('input').at(0).simulate('change', { target: { value } });
  }

  get fromPortIsInvalid() {
    return this.wrapper.find('input').at(0).parents('td').hasClass('has-error');
  }

  get toPort() {
    return this.wrapper.find('input').at(1).props().value;
  }

  set toPort(value) {
    this.wrapper.find('input').at(1).simulate('change', { target: { value } });
  }

  get toPortIsInvalid() {
    return this.wrapper.find('input').at(1).parents('td').hasClass('has-error');
  }

  get cidr() {
    return this.wrapper.find('input').at(2).props().value;
  }

  set cidr(value) {
    this.wrapper.find('input').at(2).simulate('change', { target: { value } });
  }

  get cidrIsInvalid() {
    return this.wrapper.find('input').at(2).parents('td').hasClass('has-error');
  }

  get description() {
    return this.wrapper.find('input').at(3).props().value;
  }

  set description(value) {
    this.wrapper.find('input').at(3).simulate('change', { target: { value } });
  }

  submitForm() {
    this.wrapper.find('form').simulate('submit');
  }
}

import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  actWait,
  findButtonByText,
  updateWrapper,
} from '@waldur/core/testUtils';
import {
  FloatingIp,
  OpenStackInstance,
} from '@waldur/openstack/openstack-instance/types';

import { UpdateFloatingIpsDialog } from './UpdateFloatingIpsDialog';

export const fakeInstance = ({
  name: 'backup',
  uuid: 'bcbb973635754084a5b292ecb2274e33',
  service_settings_uuid: 'a500a20d8f7040eabb9e0103d5f119af',
  floating_ips: [
    {
      url:
        '/api/openstacktenant-floating-ips/6d596ebfa7a5444abd634d6285a22339/',
      uuid: '6d596ebfa7a5444abd634d6285a22339',
      address: '172.17.65.174',
      subnet: '/api/openstacktenant-subnets/7350f289a6d14e4bbd780ee59b2899e6/',
      subnet_uuid: '7350f289a6d14e4bbd780ee59b2899e6',
      subnet_name: 'theses-and-papers-on-mach-sub-net',
      subnet_cidr: '192.168.42.0/24',
    },
  ],
  internal_ips_set: [
    {
      subnet: '/api/openstacktenant-subnets/7350f289a6d14e4bbd780ee59b2899e6/',
      subnet_uuid: '7350f289a6d14e4bbd780ee59b2899e6',
      subnet_name: 'theses-and-papers-on-mach-sub-net',
      subnet_cidr: '192.168.42.0/24',
    },
  ],
} as unknown) as OpenStackInstance;

export const fakeFloatingIPs = ([
  {
    url: '/api/openstacktenant-floating-ips/377b9ffae7c24783a204ec37c505710c/',
    address: '172.17.66.254',
  },
  {
    url: '/api/openstacktenant-floating-ips/44ececd11e674287abc87b2cdf503948/',
    address: '172.17.65.0',
  },
] as unknown) as FloatingIp[];

type DialogWrapperType = ReactWrapper<typeof UpdateFloatingIpsDialog>;

export class DialogFixture {
  store: Store;
  instance: OpenStackInstance;
  wrapper: DialogWrapperType;

  constructor(store: Store, instance: OpenStackInstance = fakeInstance) {
    this.store = store;
    this.instance = instance;
  }

  async render() {
    this.wrapper = mount<typeof UpdateFloatingIpsDialog>(
      <Provider store={this.store}>
        <UpdateFloatingIpsDialog resolve={{ resource: this.instance }} />
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

  submitForm() {
    this.wrapper.find('form').simulate('submit');
  }

  addRow() {
    findButtonByText(this.wrapper, 'Add').simulate('click');
  }

  deleteRow() {
    this.wrapper
      .findWhere(
        (node) => node.type() === 'button' && node.prop('title') === 'Delete',
      )
      .simulate('click');
  }

  get subnet() {
    return this.wrapper.find('select').at(0).props().value;
  }

  set subnet(value) {
    this.wrapper.find('select').at(0).simulate('change', {
      target: { value },
    });
  }

  get floatingIp() {
    return this.wrapper.find('select').at(1).props().value;
  }

  set floatingIp(value) {
    this.wrapper.find('select').at(1).simulate('change', {
      target: { value },
    });
  }
}

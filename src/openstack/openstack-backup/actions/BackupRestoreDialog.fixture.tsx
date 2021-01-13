import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import Select from 'react-select';
import { Store } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  actWait,
  findButtonByText,
  updateWrapper,
} from '@waldur/core/testUtils';
import { Flavor, Subnet } from '@waldur/openstack/openstack-instance/types';

import { OpenStackBackup } from '../types';

import { BackupRestoreDialog } from './BackupRestoreDialog';

export const fakeSubnet = ({
  url: '/api/openstacktenant-subnets/51e584157094493ca121f71642c0a409/',
  name: 'p60347-sub-net',
  cidr: '192.168.42.0/24',
} as unknown) as Subnet;

export const fakeBackup = ({
  url: '/api/openstacktenant-backups/21693289bd78400db79fb2a0ef2ba177/',
  uuid: '21693289bd78400db79fb2a0ef2ba177',
  name: 'After 9th lab',
  service: '/api/openstacktenant/9a70f7a88c514886912c307b8c89a6b3/',
  service_name: 'maximizeweb-enabledinfrastructures',
  service_uuid: '9a70f7a88c514886912c307b8c89a6b3',
  service_settings: '/api/service-settings/43c3b302130c414faa138c14d0e69017/',
  service_settings_uuid: '43c3b302130c414faa138c14d0e69017',
  resource_type: 'OpenStackTenant.Backup',
  instance: '/api/openstacktenant-instances/6f271860e0764d8cb79573226b726b53/',
  instance_name: 'empowerseamlessinfrastructures',
  instance_security_groups: [
    {
      url:
        '/api/openstacktenant-security-groups/fce1fed2b8dd40b8b98252c4df76007f/',
      name: 'traefik',
    },
    {
      url:
        '/api/openstacktenant-security-groups/5bf390b13f194a1fa3fd397631eaac19/',
      name: 'IMAPS',
    },
  ],
  instance_internal_ips_set: [
    {
      subnet: fakeSubnet.url,
      subnet_name: fakeSubnet.name,
      subnet_cidr: fakeSubnet.cidr,
    },
  ],
  instance_floating_ips: [
    {
      url:
        '/api/openstacktenant-floating-ips/fd9245c1468b4cf0b73d33d4dcdce219/',
      uuid: 'fd9245c1468b4cf0b73d33d4dcdce219',
      address: '8.8.8.8',
      subnet: fakeSubnet.url,
      subnet_uuid: fakeSubnet.uuid,
      subnet_name: fakeSubnet.name,
      subnet_cidr: fakeSubnet.cidr,
    },
  ],
} as unknown) as OpenStackBackup;

export const fakeFlavors = ([
  {
    url: '/api/openstacktenant-flavors/7e9a8c7f17f34706bf755abdae41fe3a/',
    uuid: '7e9a8c7f17f34706bf755abdae41fe3a',
    name: 'm1.xsmall',
    settings: '/api/service-settings/a926568f29df442e8eb447459d3121a1/',
    cores: 1,
    ram: 1024,
    disk: 10240,
  },
  {
    url: '/api/openstacktenant-flavors/7a8c733bd6bf4560ae8b2d08129e1840/',
    uuid: '7a8c733bd6bf4560ae8b2d08129e1840',
    name: 'm1.small',
    settings: '/api/service-settings/a926568f29df442e8eb447459d3121a1/',
    cores: 1,
    ram: 2048,
    disk: 20480,
  },
] as unknown) as Flavor[];

type DialogWrapperType = ReactWrapper<typeof BackupRestoreDialog>;

export class DialogFixture {
  store: Store;
  backup: OpenStackBackup;
  wrapper: DialogWrapperType;

  constructor(store: Store, backup: OpenStackBackup = fakeBackup) {
    this.store = store;
    this.backup = backup;
  }

  async render() {
    this.wrapper = mount<typeof BackupRestoreDialog>(
      <Provider store={this.store}>
        <BackupRestoreDialog resolve={{ resource: this.backup }} />
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

  get addButton() {
    return findButtonByText(this.wrapper, 'Add');
  }

  addRow() {
    this.addButton.simulate('click');
  }

  deleteRow() {
    this.wrapper
      .findWhere(
        (node) => node.type() === 'button' && node.prop('title') === 'Delete',
      )
      .simulate('click');
  }

  get securityGroupsSelector() {
    return this.wrapper.find(Select).at(1);
  }

  get flavorSelector() {
    return this.wrapper.find(Select).at(0);
  }

  selectFirstFlavor() {
    // https://github.com/enzymejs/enzyme/issues/400

    // Find input field on Select component (from the react-select module).
    const input = this.flavorSelector.find('input').at(1);

    // Simulate the arrow down event to open the dropdown menu.
    input.simulate('keyDown', { key: 'ArrowDown', keyCode: 40 });

    // Simulate the enter key to select the first option.
    input.simulate('keyDown', { key: 'Enter', keyCode: 13 });
  }
}

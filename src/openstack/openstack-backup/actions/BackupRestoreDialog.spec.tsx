import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { FloatingIp } from '@waldur/openstack/openstack-instance/types';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeBackup,
  fakeFlavors,
  fakeSubnet,
} from './BackupRestoreDialog.fixture';

jest.mock('@waldur/openstack/api');

const apiMock = api as jest.Mocked<typeof api>;

describe('BackupRestoreDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadFlavors.mockResolvedValue([]);
    apiMock.loadSecurityGroups.mockResolvedValue([]);
    apiMock.loadFloatingIps.mockResolvedValue([]);
    apiMock.loadSubnets.mockResolvedValue([]);
  });

  it('renders current instance name in modal dialog title', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.modalTitle).toBe(
      'Restore virtual machine from backup After 9th lab',
    );
  });

  it('renders loading spinner while floating IPs are being loaded', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.hasSpinner).toBeTruthy();
  });

  it('disables submit button while floating IPs are being loaded', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.submitButton.prop('disabled')).toBe(true);
  });

  it('filters related resources by service settings', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(apiMock.loadFlavors).toBeCalledWith(
      fakeBackup.service_settings_uuid,
    );
    expect(apiMock.loadSecurityGroups).toBeCalledWith(
      fakeBackup.service_settings_uuid,
    );
    expect(apiMock.loadFloatingIps).toBeCalledWith(
      fakeBackup.service_settings_uuid,
    );
    expect(apiMock.loadSubnets).toBeCalledWith(
      fakeBackup.service_settings_uuid,
    );
  });

  it('renders error message when flavors are rejected', async () => {
    apiMock.loadFlavors.mockRejectedValue([]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.modalBody).toBe('Unable to load data.');
  });

  it('renders error message when security groups are rejected', async () => {
    apiMock.loadSecurityGroups.mockRejectedValue([]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.modalBody).toBe('Unable to load data.');
  });

  it('renders error message when floating IPs are rejected', async () => {
    apiMock.loadFloatingIps.mockRejectedValue([]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.modalBody).toBe('Unable to load data.');
  });

  it('renders error message when subnets are rejected', async () => {
    apiMock.loadSubnets.mockRejectedValue([]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.modalBody).toBe('Unable to load data.');
  });

  it('initiates form with empty security groups if instance does not have it', async () => {
    const dialog = new DialogFixture(store, {
      ...fakeBackup,
      instance_security_groups: [],
    });
    await dialog.render();
    await dialog.update();
    expect(dialog.securityGroupsSelector.prop('options')).toEqual([]);
  });

  it('initiates form with non-empty security groups if instance does have it', async () => {
    apiMock.loadSecurityGroups.mockResolvedValue(
      (fakeBackup.instance_security_groups as unknown) as SecurityGroup[],
    );
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.securityGroupsSelector.prop('options').length).toBe(
      fakeBackup.instance_security_groups.length,
    );
  });

  it('initiates form with empty networks list if instance does not have it', async () => {
    const dialog = new DialogFixture(store, {
      ...fakeBackup,
      instance_internal_ips_set: [],
    });
    await dialog.render();
    await dialog.update();
    expect(dialog.wrapper.find('tr').length).toBe(0);
  });

  it('initiates form with non-empty networks list if instance does have it', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.wrapper.find('tr').length).toBe(
      fakeBackup.instance_internal_ips_set.length,
    );
  });

  it('disables add network button if there are no subnets at all', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.addButton.prop('disabled')).toBe(true);
  });

  it('enables add network button if there is at least one free subnet', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const dialog = new DialogFixture(store, {
      ...fakeBackup,
      instance_internal_ips_set: [],
    });
    await dialog.render();
    await dialog.update();
    expect(dialog.addButton.prop('disabled')).toBe(false);
  });

  it('adds new network when add button is clicked', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const dialog = new DialogFixture(store, {
      ...fakeBackup,
      instance_internal_ips_set: [],
    });
    await dialog.render();
    await dialog.update();
    dialog.addRow();
    expect(dialog.wrapper.find('tr').length).toBe(1);
  });

  it('disables floating IP selector when subnet is not selected', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const dialog = new DialogFixture(store, {
      ...fakeBackup,
      instance_internal_ips_set: [],
    });
    await dialog.render();
    await dialog.update();
    dialog.addRow();
    expect(dialog.wrapper.find('select').at(1).prop('disabled')).toBe(true);
  });

  it('enables floating IP selector when subnet is selected', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const dialog = new DialogFixture(store, {
      ...fakeBackup,
      instance_internal_ips_set: [],
    });
    await dialog.render();
    await dialog.update();
    dialog.addRow();
    dialog.wrapper
      .find('select')
      .at(0)
      .simulate('change', { target: { value: fakeSubnet.url } });
    expect(dialog.wrapper.find('select').at(1).prop('disabled')).toBe(false);
  });

  it('populates floating IP selector with default items even when there are no free floating IPs', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(
      dialog.wrapper
        .find('select')
        .at(1)
        .find('option')
        .map((option) => option.text()),
    ).toEqual(['Skip floating IP assignment', 'Auto-assign floating IP']);
  });

  it('populates floating IP selector with existing items if they are returned by REST API', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    apiMock.loadFloatingIps.mockResolvedValue(([
      {
        address: '1.1.1.1',
        url: 'url1',
      },
      {
        address: '2.2.2.2',
        url: 'url2',
      },
    ] as unknown) as FloatingIp[]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(
      dialog.wrapper
        .find('select')
        .at(1)
        .find('option')
        .map((option) => option.text()),
    ).toEqual([
      'Skip floating IP assignment',
      'Auto-assign floating IP',
      '1.1.1.1',
      '2.2.2.2',
    ]);
  });

  it('disables add network button if all subnets are already used', async () => {
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.addButton.prop('disabled')).toBe(true);
  });

  it('populates flavor selector with flavor choices', async () => {
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.flavorSelector.prop('options')).toEqual([
      {
        label: 'm1.xsmall (1 vCPU, 1 GB RAM, 10 GB storage)',
        value: '/api/openstacktenant-flavors/7e9a8c7f17f34706bf755abdae41fe3a/',
      },
      {
        label: 'm1.small (1 vCPU, 2 GB RAM, 20 GB storage)',
        value: '/api/openstacktenant-flavors/7a8c733bd6bf4560ae8b2d08129e1840/',
      },
    ]);
  });

  it('deletes existing row when Delete button is clicked', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.deleteRow();
    expect(dialog.wrapper.find('tr').length).toBe(0);
  });

  it('disables submit button when flavor is not selected', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.submitButton.prop('disabled')).toBe(true);
  });

  it('enables submit button when flavor is selected', async () => {
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.selectFirstFlavor();
    expect(dialog.submitButton.prop('disabled')).toBe(false);
  });

  it('disables submit button when form is being submitted', async () => {
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.selectFirstFlavor();
    expect(dialog.submitButton.prop('disabled')).toBe(false);
    dialog.submitForm();
    expect(dialog.submitButton.prop('disabled')).toBe(true);
  });

  it('sends REST API request when form is being submitted', async () => {
    // Arrange
    apiMock.restoreBackup.mockResolvedValue(null);
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.selectFirstFlavor();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.restoreBackup).toBeCalledWith(fakeBackup.uuid, {
      flavor: fakeFlavors[0].url,
      floating_ips: [],
      internal_ips_set: [
        {
          subnet:
            '/api/openstacktenant-subnets/51e584157094493ca121f71642c0a409/',
        },
      ],
      security_groups: [
        {
          url:
            '/api/openstacktenant-security-groups/fce1fed2b8dd40b8b98252c4df76007f/',
        },
        {
          url:
            '/api/openstacktenant-security-groups/5bf390b13f194a1fa3fd397631eaac19/',
        },
      ],
    });
  });

  it('renders success notification when submit succeeded', async () => {
    // Arrange
    apiMock.restoreBackup.mockResolvedValue(null);
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.selectFirstFlavor();
    dialog.submitForm();
    await dialog.update();

    // Assert
    const state = store.getState();
    expect(state.notifications[0].status).toBe('success');
  });

  it('renders error notification when submit failed', async () => {
    // Arrange
    apiMock.restoreBackup.mockRejectedValue(null);
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.selectFirstFlavor();
    dialog.submitForm();
    await dialog.update();

    // Assert
    const state = store.getState();
    expect(state.notifications[0].status).toBe('error');
  });

  it('allows to restore backup with selected floating IP', async () => {
    // Arrange
    apiMock.restoreBackup.mockResolvedValue(null);
    apiMock.loadFlavors.mockResolvedValue(fakeFlavors);
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
    apiMock.loadFloatingIps.mockResolvedValue(([
      {
        address: '1.1.1.1',
        url: 'floating_ip_url',
      },
    ] as unknown) as FloatingIp[]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.selectFirstFlavor();
    dialog.wrapper
      .find('select')
      .at(1)
      .simulate('change', {
        target: {
          value: 'floating_ip_url',
        },
      });
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.restoreBackup).toBeCalledWith(fakeBackup.uuid, {
      flavor: fakeFlavors[0].url,
      floating_ips: [
        {
          subnet:
            '/api/openstacktenant-subnets/51e584157094493ca121f71642c0a409/',
          url: 'floating_ip_url',
        },
      ],
      internal_ips_set: [
        {
          subnet:
            '/api/openstacktenant-subnets/51e584157094493ca121f71642c0a409/',
        },
      ],
      security_groups: [
        {
          url:
            '/api/openstacktenant-security-groups/fce1fed2b8dd40b8b98252c4df76007f/',
        },
        {
          url:
            '/api/openstacktenant-security-groups/5bf390b13f194a1fa3fd397631eaac19/',
        },
      ],
    });
  });
});

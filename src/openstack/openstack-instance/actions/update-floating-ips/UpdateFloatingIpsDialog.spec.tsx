import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeFloatingIPs,
  fakeInstance,
} from './UpdateFloatingIpsDialog.fixture';

jest.mock('@waldur/openstack/api');

const apiMock = api as jest.Mocked<typeof api>;

describe('UpdateFloatingIpsDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadFloatingIps.mockResolvedValue([]);
  });

  it('renders current instance name in modal dialog title', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.modalTitle).toBe(
      'Update floating IPs in backup virtual machine',
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

  it('filters floating IPs by service settings', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(apiMock.loadFloatingIps).toBeCalledWith(
      fakeInstance.service_settings_uuid,
    );
  });

  it('renders error message when floating IPs are rejected', async () => {
    apiMock.loadFloatingIps.mockRejectedValue([]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.modalBody).toBe('Unable to load data.');
  });

  it('renders placeholder if instance is not connected to internal IPs', async () => {
    const dialog = new DialogFixture(store, {
      ...fakeInstance,
      internal_ips_set: [],
    });
    await dialog.render();
    await dialog.update();
    expect(dialog.wrapper.html()).toContain(
      'Instance is not connected to any internal subnets yet. Please connect it to internal subnet first.',
    );
  });

  it('renders floating IPs table when remote data is fetched', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.wrapper.find('tbody tr').length).toBe(1);
  });

  it('renders subnet and address for allocated floating IP', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.wrapper.find('tbody td').at(0).text()).toBe(
      'theses-and-papers-on-mach-sub-net',
    );
    expect(dialog.wrapper.find('tbody td').at(1).text()).toBe('172.17.65.174');
  });

  it('adds new row in table when Add button is clicked', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.addRow();
    expect(dialog.wrapper.find('tbody tr').length).toBe(2);
  });

  it('fills inputs with default values when new row is added', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    dialog.addRow();

    expect(dialog.subnet).toBe('');
    expect(dialog.floatingIp).toBe(true);
  });

  it('deletes existing row when Delete button is clicked', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.deleteRow();
    expect(dialog.wrapper.html()).toContain(
      'Instance does not have any floating IPs yet.',
    );
  });

  it('disables submit button when form is being submitted', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.submitButton.prop('disabled')).toBe(false);
    dialog.submitForm();
    expect(dialog.submitButton.prop('disabled')).toBe(true);
  });

  it('sends REST API request when form is being submitted', async () => {
    // Arrange
    apiMock.setFloatingIps.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.setFloatingIps).toBeCalledWith(fakeInstance.uuid, {
      floating_ips: [
        {
          subnet: fakeInstance.floating_ips[0].subnet,
          url: fakeInstance.floating_ips[0].url,
        },
      ],
    });
  });

  it('allows to add floating IP', async () => {
    // Arrange
    apiMock.loadFloatingIps.mockResolvedValue(fakeFloatingIPs);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    const subnet =
      '/api/openstacktenant-subnets/7350f289a6d14e4bbd780ee59b2899e6/';
    const floating_ip =
      '/api/openstacktenant-floating-ips/377b9ffae7c24783a204ec37c505710c/';
    dialog.deleteRow();
    dialog.addRow();
    dialog.subnet = subnet;
    dialog.floatingIp = floating_ip;
    dialog.submitForm();

    // Assert
    expect(apiMock.setFloatingIps).toBeCalledWith(fakeInstance.uuid, {
      floating_ips: [
        {
          subnet,
          url: floating_ip,
        },
      ],
    });
  });

  it('renders success notification when submit succeeded', async () => {
    // Arrange
    apiMock.loadFloatingIps.mockResolvedValue(fakeFloatingIPs);
    apiMock.setFloatingIps.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    const state = store.getState();
    expect(state.notifications[0].status).toBe('success');
  });

  it('renders error notification when submit failed', async () => {
    // Arrange
    apiMock.loadFloatingIps.mockResolvedValue(fakeFloatingIPs);
    apiMock.setFloatingIps.mockRejectedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    const state = store.getState();
    expect(state.notifications[0].status).toBe('error');
  });
});

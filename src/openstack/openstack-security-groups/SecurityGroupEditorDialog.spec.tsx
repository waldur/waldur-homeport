import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeSecurityGroup,
  defaultSecurityGroup,
} from './SecurityGroupEditorDialog.fixture';

jest.mock('@waldur/openstack/api');

const apiMock = api as jest.Mocked<typeof api>;

describe('SecurityGroupEditorDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadSecurityGroupsResources.mockResolvedValue([]);
  });

  it('renders current security group rule name in modal dialog title', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.modalTitle).toBe('Set rules in http security group');
  });

  it('renders loading spinner while security groups are being loaded', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.hasSpinner).toBeTruthy();
  });

  it('disables submit button while security groups are being loaded', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    expect(dialog.submitButton.prop('disabled')).toBe(true);
  });

  it('filters remote security groups by tenant', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(apiMock.loadSecurityGroupsResources).toBeCalledWith({
      tenant: fakeSecurityGroup.tenant,
      field: ['name', 'url'],
      o: 'name',
    });
  });

  it('renders error message when remote security groups are rejected', async () => {
    apiMock.loadSecurityGroupsResources.mockRejectedValue([]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.modalBody).toBe('Unable to load data.');
  });

  it('renders placeholder if security group does not contain any rules', async () => {
    const dialog = new DialogFixture(store, {
      ...fakeSecurityGroup,
      rules: [],
    });
    await dialog.render();
    await dialog.update();
    expect(dialog.tbody).toBe('Security group does not contain any rule yet.');
  });

  it('renders rules table when remote security groups are fetched', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.wrapper.find('tbody tr').length).toBe(1);
  });

  it('fills inputs with existing rule values', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.ethertype).toBe('IPv4');
    expect(dialog.direction).toBe('egress');
    expect(dialog.protocol).toBe('tcp');
    expect(dialog.fromPort).toBe(80);
    expect(dialog.toPort).toBe(80);
    expect(dialog.cidr).toBe('192.168.42.0/24');
    expect(dialog.description).toBe('');
  });

  it('adds new row in table when Add rule button is clicked', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.addRule();
    expect(dialog.wrapper.find('tbody tr').length).toBe(2);
  });

  it('fills inputs with default values when new rule is added', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    dialog.deleteRule();
    dialog.addRule();

    expect(dialog.ethertype).toBe('IPv4');
    expect(dialog.direction).toBe('ingress');
    expect(dialog.protocol).toBe('icmp');
    expect(dialog.fromPort).toBe(-1);
    expect(dialog.toPort).toBe(-1);
    expect(dialog.cidr).toBe('');
    expect(dialog.description).toBe('');
  });

  it('deletes existing row when Delete rule button is clicked', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.deleteRule();
    expect(dialog.tbody).toBe('Security group does not contain any rule yet.');
  });

  it('disables submit button when form is invalid', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    dialog.cidr = 'FOO';
    expect(dialog.submitButton.prop('disabled')).toBe(true);
  });

  it('validates cidr according to the ethetype', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.cidrIsInvalid).toBe(false);
    dialog.ethertype = 'IPv6';
    dialog.cidr = '10.0.0.1/24';
    expect(dialog.cidrIsInvalid).toBe(true);
  });

  it('allows to specify cidr according to IPv6', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();
    expect(dialog.cidrIsInvalid).toBe(false);
    dialog.ethertype = 'IPv6';
    dialog.cidr = '2002::1234:abcd:ffff:c0a8:101/64';
    expect(dialog.cidrIsInvalid).toBe(false);
  });

  it('validates from port min value according to the protocol', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.fromPortIsInvalid).toBe(false);
    dialog.fromPort = -1;
    dialog.protocol = 'tcp';
    expect(dialog.fromPortIsInvalid).toBe(true);
  });

  it('validates from port max value according to the protocol', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.fromPortIsInvalid).toBe(false);
    dialog.fromPort = 999;
    dialog.protocol = 'icmp';
    expect(dialog.fromPortIsInvalid).toBe(true);
  });

  it('validates to port min value according to the from port value', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.toPortIsInvalid).toBe(false);
    dialog.protocol = 'tcp';
    dialog.fromPort = 80;
    dialog.toPort = 50;
    expect(dialog.toPortIsInvalid).toBe(true);
  });

  it('validates to port max value according to the protocol', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.toPortIsInvalid).toBe(false);
    dialog.toPort = 999;
    dialog.protocol = 'icmp';
    expect(dialog.toPortIsInvalid).toBe(true);
  });

  it('validates to port as required', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.toPortIsInvalid).toBe(false);
    dialog.toPort = '';
    expect(dialog.toPortIsInvalid).toBe(true);
  });

  it('validates from port as required', async () => {
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    expect(dialog.fromPortIsInvalid).toBe(false);
    dialog.fromPort = '';
    expect(dialog.fromPortIsInvalid).toBe(true);
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
    apiMock.setSecurityGroupRules.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.setSecurityGroupRules).toBeCalledWith(
      fakeSecurityGroup.uuid,
      [
        {
          cidr: '192.168.42.0/24',
          direction: 'egress',
          ethertype: 'IPv4',
          from_port: 80,
          protocol: 'tcp',
          to_port: 80,
        },
      ],
    );
  });

  it('allows to select remote security group', async () => {
    // Arrange
    apiMock.loadSecurityGroupsResources.mockResolvedValue([
      defaultSecurityGroup,
    ]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.remoteGroup = defaultSecurityGroup.url;
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.setSecurityGroupRules).toBeCalledWith(
      fakeSecurityGroup.uuid,
      expect.arrayContaining([
        expect.objectContaining({
          remote_group: defaultSecurityGroup.url,
        }),
      ]),
    );
  });

  it('allows to provide security group description', async () => {
    // Arrange
    apiMock.loadSecurityGroupsResources.mockResolvedValue([
      defaultSecurityGroup,
    ]);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.description = 'foo';
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.setSecurityGroupRules).toBeCalledWith(
      fakeSecurityGroup.uuid,
      expect.arrayContaining([
        expect.objectContaining({
          description: 'foo',
        }),
      ]),
    );
  });

  it('renders success notification when submit succeeded', async () => {
    // Arrange
    apiMock.setSecurityGroupRules.mockResolvedValue(null);
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
    apiMock.setSecurityGroupRules.mockRejectedValue(null);
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

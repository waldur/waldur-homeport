import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeInstance,
  fakeSubnet,
} from './UpdateInternalIpsDialog.fixture';

jest.mock('@waldur/openstack/api');

const apiMock = api as jest.Mocked<typeof api>;

describe('UpdateInternalIpsDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
  });

  it('sends REST API request when form is being submitted', async () => {
    // Arrange
    apiMock.updateInternalIps.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updateInternalIps).toBeCalledWith(fakeInstance.uuid, {
      internal_ips_set: [
        {
          subnet: fakeSubnet.url,
        },
      ],
    });
  });

  it('allows to disconnect VM from subnet', async () => {
    // Arrange
    apiMock.updateInternalIps.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    const selectComponent = dialog.wrapper.find('Select').instance() as any;
    selectComponent.clearValue();
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updateInternalIps).toBeCalledWith(fakeInstance.uuid, {
      internal_ips_set: [],
    });
  });
});

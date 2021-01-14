import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeInstance,
  fakeSecurityGroups,
} from './UpdateSecurityGroupsDialog.fixture';

jest.mock('@waldur/openstack/api');

const apiMock = api as jest.Mocked<typeof api>;

describe('UpdateSecurityGroupsDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadSecurityGroups.mockResolvedValue(fakeSecurityGroups);
  });

  it('sends REST API request when form is being submitted', async () => {
    // Arrange
    apiMock.updateSecurityGroups.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updateSecurityGroups).toBeCalledWith(fakeInstance.uuid, {
      security_groups: [
        {
          url: fakeSecurityGroups[0].url,
        },
        {
          url: fakeSecurityGroups[1].url,
        },
      ],
    });
  });

  it('reset security groups of VM', async () => {
    // Arrange
    apiMock.updateSecurityGroups.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    const selectComponent = dialog.wrapper.find('Select').instance() as any;
    selectComponent.clearValue();
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updateSecurityGroups).toBeCalledWith(fakeInstance.uuid, {
      security_groups: [],
    });
  });
});

import Select from 'react-select';
import { Store } from 'redux';

import * as api from '@/openstack/api';
import { createActionStore } from '@/resource/actions/testUtils';

import {
  DialogFixture,
  fakeInstance,
  fakeSecurityGroups,
} from './UpdateSecurityGroupsDialog.fixture';

vi.mock('@/openstack/api');

const apiMock = vi.mocked(api);

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
    dialog.wrapper.find(Select).instance()['select'].clearValue();
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updateSecurityGroups).toBeCalledWith(fakeInstance.uuid, {
      security_groups: [],
    });
  });
});

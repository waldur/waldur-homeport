import {
  getDefaultItems,
  getPublicServices,
  orgWorkspaceCallbackFn,
} from '@waldur/marketplace/sidebar';
import store from '@waldur/store/store';

import { customer } from './fixtures';

jest.mock('@waldur/store/store');

const storeMock = store as jest.Mocked<typeof store>;

describe('Sidebar', () => {
  it('returns items for public services', () => {
    storeMock.getState.mockReturnValue({
      workspace: {
        customer: {
          ...customer,
        },
      },
    } as any);
    expect(orgWorkspaceCallbackFn()).toContainEqual(
      expect.objectContaining(getPublicServices(customer.uuid)),
    );
  });

  it('returns default sidebar items', () => {
    storeMock.getState.mockReturnValue({
      workspace: {
        customer: {
          ...customer,
          is_service_provider: false,
        },
      },
    } as any);
    expect(orgWorkspaceCallbackFn()).toEqual(
      expect.arrayContaining(getDefaultItems(customer.uuid)),
    );
  });
});

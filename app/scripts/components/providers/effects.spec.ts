import { showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import { setupFixture } from './effects.fixture';

describe('Provider saga', () => {
  const provider = {uuid: 'VALID_PROVIDER_UUID'};
  const state = {workspace: {customer: {url: 'VALID_CUSTOMER_URL'}}};
  const action = {payload: {name: 'Cloud provider'}};

  let fixture;
  beforeEach(() => {
    fixture = setupFixture({state, action});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create provider', () => {
    it('redirects user to details view after provider has been created', async () => {
      fixture.mockCreateProvider.mockReturnValue({data: provider});
      await fixture.createProvider();
      expect(fixture.mockGotoProviderDetails).toBeCalledWith(provider);
    });

    it('shows success message after provider has been created', async () => {
      fixture.mockCreateProvider.mockReturnValue({data: provider});
      await fixture.createProvider();
      expect(fixture.dispatched).toContainEqual(showSuccess('Provider has been created.'));
    });

    it('renders form error if provider creation fails', async () => {
      const response = Promise.reject({data: 'Invalid provider credentials.'});
      fixture.mockCreateProvider.mockReturnValue(response);
      await fixture.createProvider();
      const createFailure = actions.createProvider.failure().type;
      expect(fixture.hasActionWithType(createFailure)).toBe(true);
    });
  });

  describe('update provider', () => {
    it('shows success message after provider has been updated', async () => {
      fixture.mockUpdateProvider.mockReturnValue(null);
      await fixture.updateProvider();
      expect(fixture.dispatched).toContainEqual(showSuccess('Provider has been updated.'));
    });

    it('renders form error if provider update fails', async () => {
      const response = Promise.reject({data: 'Invalid provider credentials.'});
      fixture.mockUpdateProvider.mockReturnValue(response);
      await fixture.updateProvider();
      const updateFailure = actions.updateProvider.failure().type;
      expect(fixture.hasActionWithType(updateFailure)).toBe(true);
    });
  });
});

import { showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import { setupFixture } from './effects.fixture';

describe('Provider saga', () => {
  const state = { workspace: { customer: { url: 'VALID_CUSTOMER_URL' } } };
  const action = { payload: { name: 'Cloud provider' } };

  let fixture;
  beforeEach(() => {
    fixture = setupFixture({ state, action });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('update provider', () => {
    it('shows success message after provider has been updated', async () => {
      fixture.mockUpdateProvider.mockReturnValue(null);
      await fixture.updateProvider();
      expect(fixture.dispatched).toContainEqual(
        showSuccess('Provider has been updated.'),
      );
    });

    it('renders form error if provider update fails', async () => {
      const response = Promise.reject({
        data: 'Invalid provider credentials.',
      });
      fixture.mockUpdateProvider.mockReturnValue(response);
      await fixture.updateProvider();
      const updateFailure = actions.updateProvider.failure().type;
      expect(fixture.hasActionWithType(updateFailure)).toBe(true);
    });
  });
});

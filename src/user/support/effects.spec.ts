import { showSuccess } from '@waldur/store/coreSaga';
import * as actions from '@waldur/user/support/actions';
import { setupFixture } from '@waldur/user/support/effects.fixture';

describe('User side effects', () => {
  const user = { uuid: 'uuid', user_name: 'user_name' };

  let fixture;
  beforeEach(() => {
    fixture = setupFixture();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows success message if user has been updated', async () => {
    fixture.mockUpdateUser.mockReturnValue({ data: user });
    await fixture.updateUser({ payload: { user } });
    expect(fixture.dispatched).toContainEqual(
      showSuccess('User has been updated'),
    );
  });

  it('rejects promise if user update has failed', async () => {
    fixture.mockUpdateUser.mockReturnValue(
      Promise.reject({ data: 'User could not be updated' }),
    );
    await fixture.updateUser({ payload: { user } });
    const createFailure = actions.updateUser.failure().type;
    expect(fixture.hasActionWithType(createFailure)).toBe(true);
  });
});

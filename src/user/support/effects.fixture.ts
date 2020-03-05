import { runSaga } from 'redux-saga';

import * as api from './api';
import * as effects from './effects';

export const setupFixture = (state = {}) => {
  const mockUpdateUser = jest.spyOn(api, 'updateUser');
  const updateUser = action =>
    runSaga(store, effects.handleUpdateUser, action).done;
  const hasActionWithType = type =>
    dispatched.find(a => a.type === type) !== undefined;

  const dispatched = [];
  const store = {
    dispatch: a => dispatched.push(a),
    getState: () => state,
  };

  return {
    dispatched,
    hasActionWithType,
    mockUpdateUser,
    updateUser,
  };
};

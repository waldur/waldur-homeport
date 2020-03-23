import { runSaga } from 'redux-saga';

import * as api from './api';
import * as effects from './effects';

export const setupFixture = ({ state, action }) => {
  const mockUpdateProvider = jest.spyOn(api, 'updateProvider');
  jest.spyOn(api, 'refreshProjectList').mockReturnValue(null);

  const dispatched = [];
  const store = {
    dispatch: a => dispatched.push(a),
    getState: () => state,
  };
  const updateProvider = () =>
    runSaga(store, effects.handleUpdateProvider, action).done;
  const hasActionWithType = type =>
    dispatched.find(a => a.type === type) !== undefined;

  return {
    dispatched,
    updateProvider,
    mockUpdateProvider,
    hasActionWithType,
  };
};

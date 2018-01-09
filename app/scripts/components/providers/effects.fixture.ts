import { runSaga } from 'redux-saga';

import * as api from './api';
import * as effects from './effects';

export const setupFixture = ({state, action}) => {
  const mockCreateProvider = jest.spyOn(api, 'createProvider');
  const mockUpdateProvider = jest.spyOn(api, 'updateProvider');
  const mockGotoProviderDetails = jest.spyOn(api, 'gotoProviderDetails').mockReturnValue(null);
  jest.spyOn(api, 'refreshProjectList').mockReturnValue(null);
  jest.spyOn(api, 'refreshProvidersList').mockReturnValue(null);

  const dispatched = [];
  const store = ({
    dispatch: a => dispatched.push(a),
    getState: () => state,
  });
  const createProvider = () => runSaga(store, effects.handleCreateProvider, action).done;
  const updateProvider = () => runSaga(store, effects.handleUpdateProvider, action).done;
  const hasActionWithType = type => dispatched.find(a => a.type === type) !== undefined;

  return {
    dispatched,
    createProvider,
    updateProvider,
    mockCreateProvider,
    mockUpdateProvider,
    mockGotoProviderDetails,
    hasActionWithType,
  };
};

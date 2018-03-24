import { runSaga } from 'redux-saga';

import * as api from './api';
import * as effects from './effects';

export const setupFixture = (state = {}) => {
  const mockUpdatePythonManagement = jest.spyOn(api, 'updatePythonManagement');
  const mockGotoPythonManagementDetails = jest.spyOn(api, 'gotoPythonManagementDetails');
  const mockCreatePythonManagement = jest.spyOn(api, 'createPythonManagement');
  const updatePythonManagement = action => runSaga(store, effects.handleUpdatePythonManagement, action).done;
  const createPythonManagement = action => runSaga(store, effects.handleCreatePythonManagement, action).done;
  const hasActionWithType = type => dispatched.find(a => a.type === type) !== undefined;

  const dispatched = [];
  const store = ({
    dispatch: a => dispatched.push(a),
    getState: () => state,
  });

  return {
    dispatched,
    hasActionWithType,
    mockUpdatePythonManagement,
    updatePythonManagement,
    createPythonManagement,
    mockGotoPythonManagementDetails,
    mockCreatePythonManagement,
  };
};

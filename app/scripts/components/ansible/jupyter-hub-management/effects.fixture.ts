import { runSaga } from 'redux-saga';

import * as commonEffects from '@waldur/ansible/python-management/commonEffects';

import * as api from './api';
import * as effects from './effects';
import * as mappers from './mappers';

export const setupFixture = (state = {}) => {
  const mockUpdateJupyterHubManagement = jest.spyOn(api, 'updateJupyterHubManagement');
  const mockGotoJupyterHubManagementDetails = jest.spyOn(api, 'gotoJupyterHubManagementDetails');
  const mockCreateJupyterHubManagement = jest.spyOn(api, 'createJupyterHubManagement');
  const mockLoadJupyterHubManagement = jest.spyOn(api, 'loadJupyterHubManagement');
  const mockMergeVirtualEnvironments = jest.spyOn(commonEffects, 'mergeVirtualEnvironments');
  const mockSetRequestsStateTypePairs = jest.spyOn(commonEffects, 'setRequestsStateTypePairs');
  const mockMergeRequests = jest.spyOn(commonEffects, 'mergeRequests');
  const mockBuildJupyterHubManagementDetailsFormData = jest.spyOn(mappers, 'buildJupyterHubManagementDetailsFormData');
  const updateJupyterHubManagement = action => runSaga(store, effects.handleUpdateJupyterHubManagement, action).done;
  const createJupyterHubManagement = action => runSaga(store, effects.handleCreateJupyterHubManagement, action).done;
  const hasActionWithType = type => dispatched.find(a => a.type === type) !== undefined;

  const dispatched = [];
  const store = ({
    dispatch: a => dispatched.push(a),
    getState: () => state,
  });

  return {
    dispatched,
    hasActionWithType,
    mockUpdateJupyterHubManagement,
    mockMergeVirtualEnvironments,
    mockLoadJupyterHubManagement,
    updateJupyterHubManagement,
    createJupyterHubManagement,
    mockGotoJupyterHubManagementDetails,
    mockCreateJupyterHubManagement,
    mockSetRequestsStateTypePairs,
    mockMergeRequests,
    mockBuildJupyterHubManagementDetailsFormData,
  };
};

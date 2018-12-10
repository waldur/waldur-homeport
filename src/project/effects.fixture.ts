import { runSaga } from 'redux-saga';

import * as api from './api';
import * as effects from './effects';

export const setupFixture = (state = {}) => {
  const mockUpdateProject = jest.spyOn(api, 'updateProject');
  jest.spyOn(api, 'dangerouslyUpdateProject').mockReturnValue(null);
  const updateProject = action => runSaga(store, effects.handleUpdateProject, action).done;
  const hasActionWithType = type => dispatched.find(a => a.type === type) !== undefined;

  const dispatched = [];
  const store = ({
    dispatch: a => dispatched.push(a),
    getState: () => state,
  });

  return {
    dispatched,
    hasActionWithType,
    mockUpdateProject,
    updateProject,
  };
};

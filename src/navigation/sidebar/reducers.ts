import { combineReducers } from 'redux';

import { projectCountersReducer } from '@waldur/project/store';

export const reducer = combineReducers({
  projectCounters: projectCountersReducer,
});

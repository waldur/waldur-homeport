import { combineReducers } from 'redux';

import { reducer as summary } from './summary/reducers';

export const reducer = combineReducers({
  summary,
});

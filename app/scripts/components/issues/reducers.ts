import { combineReducers } from 'redux';

import { reducer as attachments } from './attachments/reducers';

export const reducer = combineReducers({
  attachments,
});

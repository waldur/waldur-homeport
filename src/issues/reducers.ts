import { combineReducers } from 'redux';

import { reducer as attachments } from './attachments/reducers';
import { reducer as comments } from './comments/reducers';

export const reducer = combineReducers({
  attachments,
  comments,
});

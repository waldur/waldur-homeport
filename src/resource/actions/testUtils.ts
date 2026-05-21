import { reducer as notificationsReducer } from 'reapop';
import { combineReducers, createStore, Store } from 'redux';

export function createActionStore() {
  const reducer = combineReducers({
    notifications: notificationsReducer(),
  });
  return createStore(reducer) as Store;
}

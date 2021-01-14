import { reducer as notificationsReducer } from 'reapop';
import { combineReducers, createStore, Store } from 'redux';
import { reducer as formReducer } from 'redux-form';

export function createActionStore() {
  const reducer = combineReducers({
    form: formReducer,
    notifications: notificationsReducer(),
  });
  return createStore(reducer) as Store;
}

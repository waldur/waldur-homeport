import { combineReducers, createStore } from 'redux';

import { staticReducers } from './reducers';

const store = createStore(combineReducers(staticReducers));

export default store;

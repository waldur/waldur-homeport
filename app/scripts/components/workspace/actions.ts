import {
  USER_LOGGED_IN,
  USER_UPDATED,
  USER_LOGGED_OUT,
  SET_CURRENT_CUSTOMER,
  SET_CURRENT_PROJECT,
} from './constants';

export const userLoggedIn = user => ({
  type: USER_LOGGED_IN,
  payload: {user},
});

export const userUpdated = user => ({
  type: USER_UPDATED,
  payload: {user},
});

export const userLoggedOut = () => ({
  type: USER_LOGGED_OUT,
});

export const setCurrentCustomer = customer => ({
  type: SET_CURRENT_CUSTOMER,
  payload: {
    customer,
  },
});

export const setCurrentProject = project => ({
  type: SET_CURRENT_PROJECT,
  payload: {
    project,
  },
});

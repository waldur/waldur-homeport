const INITIAL_STATE = null;

const USER_LOGGED_IN = 'waldur/user/LOGGED_IN';
const USER_UPDATED = 'waldur/user/UPDATED';
const USER_LOGGED_OUT = 'waldur/user/LOGGED_OUT';

export const userLoggedIn = (user) => ({
  type: USER_LOGGED_IN,
  payload: {
    user
  }
});

export const userUpdated = (user) => ({
  type: USER_UPDATED,
  payload: {
    user
  }
});

export const userLoggedOut = () => ({
  type: USER_LOGGED_OUT
});

export const reducer = (state=INITIAL_STATE, action) => {
  switch(action.type) {

  case USER_LOGGED_IN:
    return action.payload.user;

  case USER_UPDATED:
    return action.payload.user;

  case USER_LOGGED_OUT:
    return null;

  default:
    return state;
  }
};

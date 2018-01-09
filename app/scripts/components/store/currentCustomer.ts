import { Customer } from './types';

const SET_CURRENT_CUSTOMER = 'waldur/customer/SET_CURRENT';

export const setCurrentCustomer = project => ({
  type: SET_CURRENT_CUSTOMER,
  payload: {
    project,
  },
});

export const reducer = (state = null, action) => {
  switch (action.type) {

  case SET_CURRENT_CUSTOMER:
    return action.payload.project;

  default:
    return state;
  }
};

export const getCurrentCustomer: (state: any) => Customer = state => state.currentCustomer;

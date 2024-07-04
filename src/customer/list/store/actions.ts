import * as constants from '../constants';

export const setOrganizationLocation = (customer) => ({
  type: constants.SET_ORGANIZATION_LOCATION,
  payload: customer,
});

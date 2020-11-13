import * as constants from '../constants';

export const updateOrganization = (formData) => ({
  type: constants.UPDATE_ORGANIZATION,
  payload: formData,
});

export const setOrganizationLocation = (customer) => ({
  type: constants.SET_ORGANIZATION_LOCATION,
  payload: customer,
});

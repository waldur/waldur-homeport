import * as constants from '../constants';

export const updateOrganization = (formData) => ({
  type: constants.UPDATE_ORGANIZATION,
  payload: formData,
});

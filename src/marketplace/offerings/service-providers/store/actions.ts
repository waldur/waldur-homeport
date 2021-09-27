import * as constants from '../constants';

export const updateServiceProviderDescription = (uuid: string, formData) => ({
  type: constants.UPDATE_SERVICE_PROVIDER_DESCRIPTION,
  payload: {
    uuid: uuid,
    formData: formData,
  },
});

import { formDataSelector } from '@waldur/marketplace/utils';
import { RootState } from '@waldur/store/reducers';

export const formAttributesSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.attributes || {};
};

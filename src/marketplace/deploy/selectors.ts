import { useFormState } from 'react-final-form';

import { DeployFormData } from '../common/types';

export const useOrderFormData = () => {
  const { values } = useFormState<DeployFormData>({
    subscription: { values: true },
  });
  return values;
};

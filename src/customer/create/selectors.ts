import { RootState } from '@waldur/store/reducers';
import { isStaff } from '@waldur/workspace/selectors';

export const canCreateOrganization = (state: RootState): boolean =>
  isStaff(state);

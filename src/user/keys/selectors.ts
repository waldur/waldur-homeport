import { getUser } from '@waldur/issues/comments/selectors';
import { isStaff } from '@waldur/workspace/selectors';

export const isStaffOrSelfSelectorCreator = stateParams => state =>
  stateParams.uuid === undefined ||
  stateParams.uuid === getUser(state).uuid ||
  isStaff(state);

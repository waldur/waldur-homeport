import { getUser } from '@waldur/issues/comments/selectors';
import { RootState } from '@waldur/store/reducers';
import { isStaff } from '@waldur/workspace/selectors';

export const isStaffOrSelfSelectorCreator = (stateParams) => (
  state: RootState,
) =>
  stateParams.uuid === undefined ||
  stateParams.uuid === getUser(state)?.uuid ||
  isStaff(state);

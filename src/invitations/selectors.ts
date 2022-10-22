import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { InvitationPolicyService } from './actions/InvitationPolicyService';

export const canAccessInvitations = (state: RootState) => {
  const user = getUser(state);
  const customer = getCustomer(state);
  const project = getProject(state);
  return InvitationPolicyService.canAccessInvitations({
    user,
    customer,
    project,
  });
};

import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

export const WORKSPACE_STATE_PROPOSALS = {
  [ORGANIZATION_WORKSPACE]: 'public-proposals-customer',
  [PROJECT_WORKSPACE]: 'public-proposals-project',
  [USER_WORKSPACE]: 'public-proposals-user',
};

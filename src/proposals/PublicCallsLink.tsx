import { useSelector } from 'react-redux';

import { getWorkspace } from '@waldur/workspace/selectors';

import { WORKSPACE_STATE_CALLS } from './constants';

export const usePublicCallsLink = () => {
  const workspace = useSelector(getWorkspace);
  if (!workspace) return 'public.public-calls';
  return WORKSPACE_STATE_CALLS[workspace] || 'public.public-calls';
};

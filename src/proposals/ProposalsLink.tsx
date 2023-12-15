import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { WORKSPACE_STATE_PROPOSALS } from './constants';

export const useProposalsLink = () => {
  const { state: currentState, params } = useCurrentStateAndParams();
  const workspace = useSelector(getWorkspace);
  return useMemo(() => {
    let state = 'public.public-proposals';
    let stateParams;
    if (
      !['reporting', 'admin', 'support', 'public'].some((parent) =>
        isDescendantOf(parent, currentState),
      )
    ) {
      state = WORKSPACE_STATE_PROPOSALS[workspace] || 'public.public-proposals';
      if (workspace === ORGANIZATION_WORKSPACE && params.uuid) {
        stateParams = { uuid: params.uuid };
      }
    }
    return { state, stateParams };
  }, [workspace, currentState, params]);
};

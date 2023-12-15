import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { WORKSPACE_LANDING } from '../constants';

interface OwnProps {
  className?: string;
}

export const useMarketplaceLandingLink = () => {
  const { state: currentState, params } = useCurrentStateAndParams();
  const workspace = useSelector(getWorkspace);
  return useMemo(() => {
    let state = 'public.marketplace-landing';
    let stateParams;
    if (
      !['reporting', 'admin', 'support', 'public'].some((parent) =>
        isDescendantOf(parent, currentState),
      )
    ) {
      state = WORKSPACE_LANDING[workspace] || 'public.marketplace-landing';
      if (workspace === ORGANIZATION_WORKSPACE && params.uuid) {
        stateParams = { uuid: params.uuid };
      }
    }
    return { state, stateParams };
  }, [workspace, currentState, params]);
};

export const LandingLink: FunctionComponent<OwnProps> = (props) => {
  const { state, stateParams } = useMarketplaceLandingLink();
  return (
    <Link state={state} className={props.className} params={stateParams}>
      {props.children}
    </Link>
  );
};

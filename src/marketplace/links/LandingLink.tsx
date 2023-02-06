import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { WORKSPACE_LANDING } from '../constants';

interface OwnProps {
  className?: string;
}

export const LandingLink: FunctionComponent<OwnProps> = (props) => {
  const { state: currentState, params } = useCurrentStateAndParams();
  const workspace = useSelector(getWorkspace);
  let state = WORKSPACE_LANDING[workspace] || 'public.marketplace-landing';
  let stateParams;
  if (workspace === ORGANIZATION_WORKSPACE && params.uuid) {
    stateParams = { uuid: params.uuid };
  }
  if (!state || !stateParams) {
    if (
      isDescendantOf('reporting', currentState) ||
      isDescendantOf('admin', currentState) ||
      isDescendantOf('support', currentState)
    ) {
      state = 'public.marketplace-landing';
    }
  }
  return (
    <Link state={state} className={props.className} params={stateParams}>
      {props.children}
    </Link>
  );
};

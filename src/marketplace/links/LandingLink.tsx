import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { WORKSPACE_LANDING } from '../constants';

interface OwnProps {
  className?: string;
}

export const LandingLink: FunctionComponent<OwnProps> = (props) => {
  const { params } = useCurrentStateAndParams();
  const workspace = useSelector(getWorkspace);
  const state = WORKSPACE_LANDING[workspace] || 'public.marketplace-landing';
  let stateParams;
  if (workspace === ORGANIZATION_WORKSPACE) {
    stateParams = { uuid: params.uuid };
  }
  return (
    <Link state={state} className={props.className} params={stateParams}>
      {props.children}
    </Link>
  );
};

import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { WORKSPACE_LANDING } from '../constants';

interface OwnProps {
  className?: string;
}

export const LandingLink: FunctionComponent<OwnProps> = (props) => {
  const workspace = useSelector(getWorkspace);
  const state =
    WORKSPACE_LANDING[workspace] || WORKSPACE_LANDING[USER_WORKSPACE];
  return (
    <Link state={state} className={props.className}>
      {props.children}
    </Link>
  );
};

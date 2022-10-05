import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';

import { WORKSPACE_LANDING } from '../constants';

interface OwnProps {
  className?: string;
}

export const LandingLink: FunctionComponent<OwnProps> = (props) => {
  const workspace = useSelector(getWorkspace);
  const state = WORKSPACE_LANDING[workspace] || 'marketplace-landing.details';
  return (
    <Link state={state} className={props.className}>
      {props.children}
    </Link>
  );
};

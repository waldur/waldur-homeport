import * as React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';

interface OwnProps {
  offering_uuid: string;
  className?: string;
}

const stateSelector = state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return 'marketplace-offering-customer';
  } else {
    return 'marketplace-offering';
  }
};

export const OfferingLink: React.FC<OwnProps> = props => {
  const state = useSelector(stateSelector);
  return (
    <Link
      state={state}
      params={{ offering_uuid: props.offering_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

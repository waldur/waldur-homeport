import * as React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';

interface OwnProps {
  category_uuid: string;
  className?: string;
}

const stateSelector = state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return 'marketplace-category-customer';
  } else {
    return 'marketplace-category';
  }
};

export const CategoryLink: React.FC<OwnProps> = props => {
  const state = useSelector(stateSelector);
  return (
    <Link
      state={state}
      params={{ category_uuid: props.category_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

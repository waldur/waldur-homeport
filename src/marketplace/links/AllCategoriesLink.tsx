import React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { WORKSPACE_ALL_CATEGORIES } from '@waldur/marketplace/constants';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';

interface OwnProps {
  className?: string;
}

const stateSelector = (state: RootState) => {
  const workspace = getWorkspace(state);
  return (
    WORKSPACE_ALL_CATEGORIES[workspace] || 'marketplace-categories.details'
  );
};

export const AllCategoriesLink: React.FC<OwnProps> = (props) => {
  const state = useSelector(stateSelector);
  return (
    <Link state={state} className={props.className}>
      {props.children}
    </Link>
  );
};

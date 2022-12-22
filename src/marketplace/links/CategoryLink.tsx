import React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { WORKSPACE_CATEGORY } from '@waldur/marketplace/constants';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';

interface OwnProps {
  category_uuid: string;
  className?: string;
}

export const offeringCategoryStateSelector = (state: RootState) => {
  const workspace = getWorkspace(state);
  return WORKSPACE_CATEGORY[workspace] || 'public.marketplace-category';
};

export const CategoryLink: React.FC<OwnProps> = (props) => {
  const state = useSelector(offeringCategoryStateSelector);
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

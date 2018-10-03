import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';

const PureCategoryLink = props => (
  <Link
    state={props.state}
    params={{category_uuid: props.category_uuid}}
    className={props.className}>
    {props.children}
  </Link>
);

const connector = connect<{state: string}, {}, {category_uuid: string, className?: string}>(state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      state: 'marketplace-category-customer',
    };
  } else {
    return {
      state: 'marketplace-category',
    };
  }
});

export const CategoryLink = connector(PureCategoryLink);

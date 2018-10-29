import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

interface StateProps {
  state: string;
}

interface OwnProps {
  category_uuid: string;
  className?: string;
}

type MergedProps = StateProps & OwnProps;

const PureCategoryLink: React.SFC<MergedProps> = props => (
  <Link
    state={props.state}
    params={{category_uuid: props.category_uuid}}
    className={props.className}>
    {props.children}
  </Link>
);

const connector = connect<StateProps, {}, OwnProps, OuterState>(state => {
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

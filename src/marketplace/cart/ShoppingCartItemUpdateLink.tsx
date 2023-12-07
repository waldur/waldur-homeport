import React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

interface OwnProps {
  order_uuid: string;
  className?: string;
}

const stateSelector = (state: RootState) => {
  const workspace = getWorkspace(state);
  if (workspace === ORGANIZATION_WORKSPACE) {
    return 'marketplace-shopping-cart-item-update-customer';
  } else {
    return 'marketplace-shopping-cart-item-update';
  }
};

export const ShoppingCartItemUpdateLink: React.FC<OwnProps> = (props) => {
  const state = useSelector(stateSelector);
  return (
    <Link
      state={state}
      params={{ order_uuid: props.order_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

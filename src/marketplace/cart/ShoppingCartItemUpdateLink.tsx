import * as React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

interface OwnProps {
  order_item_uuid: string;
  className?: string;
}

const stateSelector = (state) => {
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
      params={{ order_item_uuid: props.order_item_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

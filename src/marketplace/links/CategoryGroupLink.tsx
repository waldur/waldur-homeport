import React, { PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  item;
  className?: string;
}

export const CategoryGroupLink: React.FC<PropsWithChildren<OwnProps>> = (
  props,
) => {
  return (
    <Link
      state="public.marketplace-category-group"
      params={{ group_uuid: props.item.uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

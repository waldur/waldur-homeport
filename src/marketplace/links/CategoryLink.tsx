import React, { PropsWithChildren } from 'react';

import { Link } from '@/core/Link';

interface OwnProps {
  item;
  className?: string;
}

export const CategoryLink: React.FC<PropsWithChildren<OwnProps>> = (props) => {
  return (
    <Link
      state="public.marketplace-category"
      params={{ category_uuid: props.item.uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

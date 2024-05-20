import React, { PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  category_uuid: string;
  className?: string;
}

export const CategoryLink: React.FC<PropsWithChildren<OwnProps>> = (props) => {
  return (
    <Link
      state="public.marketplace-category"
      params={{ category_uuid: props.category_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

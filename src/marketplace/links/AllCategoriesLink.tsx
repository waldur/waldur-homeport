import React, { PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  className?: string;
}

export const AllCategoriesLink: React.FC<PropsWithChildren<OwnProps>> = (
  props,
) => {
  return (
    <Link state="public.marketplace-categories" className={props.className}>
      {props.children}
    </Link>
  );
};

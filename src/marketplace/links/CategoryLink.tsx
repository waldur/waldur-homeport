import React, { PropsWithChildren } from 'react';

import { Link } from '@/core/Link';

interface OwnProps {
  item;
  className?: string;
}

export const CategoryLink: React.FC<PropsWithChildren<OwnProps>> = ({
  item,
  className,
  children,
  ...rest
}) => {
  return (
    <Link
      state="public.marketplace-category"
      params={{ category_uuid: item.uuid }}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
};

import React, { PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  offering_uuid: string;
  className?: string;
}

export const OfferingLink: React.FC<PropsWithChildren<OwnProps>> = (props) => {
  return (
    <Link
      state="marketplace-offering-public"
      params={{ offering_uuid: props.offering_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};

import React, { PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  offering_uuid: string;
  className?: string;
  disabled?: boolean;
}

export const OfferingLink: React.FC<PropsWithChildren<OwnProps>> = (props) => {
  return !props.disabled ? (
    <Link
      state="marketplace-offering-public"
      params={{ offering_uuid: props.offering_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  ) : (
    <div className={props.className}>{props.children}</div>
  );
};

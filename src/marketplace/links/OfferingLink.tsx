import React, { PropsWithChildren } from 'react';
import { Variant } from 'react-bootstrap/esm/types';

import { Link } from '@/core/Link';

interface OwnProps {
  offering_uuid: string;
  buttonVariant?: Variant;
  className?: string;
  disabled?: boolean;
}

export const OfferingLink: React.FC<PropsWithChildren<OwnProps>> = (props) => {
  return !props.disabled ? (
    <Link
      state="marketplace-offering-public"
      params={{ offering_uuid: props.offering_uuid }}
      buttonVariant={props.buttonVariant}
      className={props.className}
    >
      {props.children}
    </Link>
  ) : (
    <div className={props.className}>{props.children}</div>
  );
};

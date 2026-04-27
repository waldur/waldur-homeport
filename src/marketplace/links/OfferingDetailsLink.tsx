import React, { PropsWithChildren } from 'react';
import { Variant } from 'react-bootstrap/esm/types';

import { Link } from '@/core/Link';

interface OwnProps {
  offering_uuid: string;
  className?: string;
  buttonVariant?: Variant;
  disabled?: boolean;
}

export const OfferingDetailsLink: React.FC<PropsWithChildren<OwnProps>> = (
  props,
) => {
  return !props.disabled ? (
    <Link
      state="public-offering.marketplace-public-offering"
      params={{ uuid: props.offering_uuid }}
      buttonVariant={props.buttonVariant}
      className={props.className}
    >
      {props.children}
    </Link>
  ) : (
    <div className={props.className}>{props.children}</div>
  );
};

import React, { PropsWithChildren } from 'react';

import { ButtonVariant, ButtonSize } from 'waldur-ui';

import { Link } from '@/core/Link';

interface OwnProps {
  offering_uuid: string;
  className?: string;
  buttonVariant?: ButtonVariant;
  /** Size and shape of the link when it renders as a button (`buttonVariant`). */
  buttonSize?: ButtonSize;
  buttonIconOnly?: boolean;
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
      buttonSize={props.buttonSize}
      buttonIconOnly={props.buttonIconOnly}
      className={props.className}
    >
      {props.children}
    </Link>
  ) : (
    <div className={props.className}>{props.children}</div>
  );
};

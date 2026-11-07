import React, { PropsWithChildren } from 'react';

import { ButtonVariant, ButtonSize } from 'waldur-ui';

import { Link } from '@/core/Link';
import { canViewOfferingPages } from '@/marketplace/canUseMarketplaceShopUi';
import { useUser } from '@/workspace/hooks';

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
  const user = useUser();
  // The public offering page is refused when the shop is hidden. Keep the
  // label, drop the link — the same fallback `disabled` already uses.
  if (props.disabled || !canViewOfferingPages(user)) {
    return <div className={props.className}>{props.children}</div>;
  }
  return (
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
  );
};

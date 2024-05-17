import { FC } from 'react';

import './OfferingLogo.scss';

import DefaultLogo from './OfferingLogo.svg';

interface OfferingLogoProps
  extends Partial<Pick<JSX.IntrinsicElements['img'], 'style'>> {
  src?: string;
  size?: string;
  className?: string;
  onClick?: () => void;
}

export const OfferingLogo: FC<OfferingLogoProps> = ({
  className = 'marketplace-offering-logo',
  ...props
}) => (
  <img
    src={props.src || DefaultLogo}
    alt="offering logo"
    className={
      props.size === 'small' ? 'marketplace-offering-logo--small' : className
    }
    style={props.style}
    onClick={props.onClick}
    aria-hidden="true"
  />
);

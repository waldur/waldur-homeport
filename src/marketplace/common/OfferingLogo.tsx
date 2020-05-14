import * as React from 'react';

import './OfferingLogo.scss';

const DefaultLogo = require('./OfferingLogo.svg');

interface OfferingLogoProps
  extends Partial<Pick<JSX.IntrinsicElements['img'], 'style'>> {
  src?: string;
  size?: string;
  className?: string;
}

export const OfferingLogo: React.FC<OfferingLogoProps> = props => (
  <img
    src={props.src || DefaultLogo}
    className={
      props.size === 'small'
        ? 'marketplace-offering-logo--small'
        : props.className
    }
    style={props.style}
  />
);

OfferingLogo.defaultProps = {
  className: 'marketplace-offering-logo',
};

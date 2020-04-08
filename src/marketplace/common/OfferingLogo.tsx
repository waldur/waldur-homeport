import * as React from 'react';

import './OfferingLogo.scss';

// eslint-disable-next-line
const DefaultLogo = require('./OfferingLogo.svg');

interface OfferingLogoProps
  extends Partial<Pick<JSX.IntrinsicElements['img'], 'style'>> {
  src?: string;
  size?: string;
}

export const OfferingLogo = (props: OfferingLogoProps) => {
  let className = 'marketplace-offering-logo';
  if (props.size === 'small') {
    className = 'marketplace-offering-logo--small';
  }
  return (
    <img
      src={props.src || DefaultLogo}
      className={className}
      style={props.style}
    />
  );
};

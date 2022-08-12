import React from 'react';

import './OfferingLogo.scss';

const DefaultLogo = require('./OfferingLogo.svg');

interface OfferingLogoProps
  extends Partial<Pick<JSX.IntrinsicElements['img'], 'style'>> {
  src?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const OfferingLogo: React.FC<OfferingLogoProps> = (props) => (
  <div
    className={`symbol symbol-${props.size}px marketplace-offering-logo-metronic ${props.className}`}
    style={props.style}
    onClick={props.onClick}
  >
    <div
      className="symbol-label image"
      style={{ backgroundImage: `url(${props.src || DefaultLogo})` }}
    ></div>
  </div>
);

OfferingLogo.defaultProps = {
  size: 75,
};

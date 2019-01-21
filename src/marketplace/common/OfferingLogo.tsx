import * as React from 'react';

import './OfferingLogo.scss';

// tslint:disable-next-line
const DefaultLogo = require('./OfferingLogo.svg');

interface OfferingLogoProps {
  src?: string;
  size?: string;
}

export const OfferingLogo = (props: OfferingLogoProps) => {
  let className = 'marketplace-offering-logo';
  if (props.size === 'small') {
    className = 'marketplace-offering-logo--small';
  }
  return (
    <img src={props.src || DefaultLogo} className={className}/>
  );
};

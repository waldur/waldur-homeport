import * as React from 'react';

import './OfferingLogo.scss';

// tslint:disable-next-line
const DefaultLogo = require('./OfferingLogo.svg');

interface OfferingLogoProps {
  src?: string;
}

export const OfferingLogo = (props: OfferingLogoProps) => (
  <img src={props.src || DefaultLogo} className="marketplace-offering-logo"/>
);

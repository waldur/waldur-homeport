import * as React from 'react';

// tslint:disable-next-line
const DefaultLogo = require('./OfferingLogo.svg');

interface OfferingLogoProps {
  src?: string;
  className?: string;
}

export const OfferingLogo = (props: OfferingLogoProps) => (
  <img src={props.src || DefaultLogo} className={props.className}/>
);

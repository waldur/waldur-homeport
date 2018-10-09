import * as React from 'react';

import './HeroSection.scss';

interface HeroSectionProps {
  title: string;
  children?: React.ReactNode;
}

export const HeroSection = (props: HeroSectionProps) => (
  <div className="marketplace-hero__background">
    <div className="marketplace-hero__table">
      <div className="marketplace-hero__main">
        <h1>{props.title}</h1>
        {props.children}
      </div>
    </div>
  </div>
);

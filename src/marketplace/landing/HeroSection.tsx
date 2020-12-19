import React, { FunctionComponent } from 'react';
import './HeroSection.scss';

interface HeroSectionProps {
  title: string;
  children?: React.ReactNode;
}

export const HeroSection: FunctionComponent<HeroSectionProps> = (props) => (
  <div className="marketplace-hero__background">
    <div className="marketplace-hero__table">
      <div className="marketplace-hero__main">
        <h1>{props.title}</h1>
        {props.children}
      </div>
    </div>
  </div>
);

import React, { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
// import './HeroSection.scss';

interface HeroSectionProps {
  title: string;
  children?: React.ReactNode;
}

export const HeroSection: FunctionComponent<HeroSectionProps> = (props) => (
  <>
    <div className="marketplace-hero__background"></div>
    <div className="marketplace-hero__table">
      <div className="marketplace-hero__cell">
        <div className="marketplace-hero__main">
          <h2>{translate('Welcome to')}</h2>
          <h1>{props.title}</h1>
          {props.children}
        </div>
      </div>
    </div>
  </>
);

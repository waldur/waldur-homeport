import { FC, PropsWithChildren } from 'react';

import './LandingHeroSection.scss';

interface LandingHeroSectionProps {
  title: string;
  header: string;
  backgroundImage?: string;
  className?: string;
}

export const LandingHeroSection: FC<
  PropsWithChildren<LandingHeroSectionProps>
> = (props) => (
  <div
    className={'landing-hero__background ' + (props.className ?? '')}
    style={
      props.backgroundImage
        ? { backgroundImage: `url(${props.backgroundImage})` }
        : null
    }
  >
    <div className="landing-hero__table">
      <div className="landing-hero__cell">
        <div className="landing-hero__main">
          <h2>{props.header}</h2>
          <h1>{props.title}</h1>
          {props.children}
        </div>
      </div>
    </div>
  </div>
);

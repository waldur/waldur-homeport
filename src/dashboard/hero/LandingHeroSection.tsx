import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import { ENV } from '@waldur/core/config';

interface LandingHeroSectionProps {
  title: string;
  header: string;
  backgroundImage?: string;
  className?: string;
  context?: 'marketplace' | 'calls';
}

export const LandingHeroSection: FC<
  PropsWithChildren<LandingHeroSectionProps>
> = (props) => {
  const sidebarStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE;
  const bgClassNames = {
    'bg-mode-dark': sidebarStyle === 'dark',
    'bg-mode-light': sidebarStyle === 'light',
    'bg-mode-accent': sidebarStyle === 'accent',
  };

  return (
    <div
      className={classNames(
        'landing-hero__background',
        props.context && `${props.context}-landing`,
        props.context && `has-overlay`,
        bgClassNames,
        props.className,
      )}
      style={
        props.backgroundImage
          ? { backgroundImage: props.backgroundImage }
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
};

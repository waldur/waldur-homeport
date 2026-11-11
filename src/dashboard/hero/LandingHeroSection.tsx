import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import { ENV } from '@/core/config';

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
  const sidebarStyle = ENV?.plugins?.WALDUR_CORE?.SIDEBAR_STYLE;
  const isLight = sidebarStyle === 'light';
  const isAccent = sidebarStyle === 'accent';
  const isLightOrAccent = isLight || isAccent;

  // A light or accent hero is light in the light theme, whatever the page:
  // the calls hero has no image, so white headings would vanish on it.
  const headingColor = isLightOrAccent
    ? 'text-primary dark:text-white'
    : 'text-white';

  return (
    <div
      data-testid="landing-hero"
      className={classNames(
        'relative h-58 w-full bg-cover bg-no-repeat',
        isLightOrAccent ? 'bg-[50%_40%] dark:bg-center' : 'bg-center',
        isLight ? 'bg-primary' : isAccent ? 'bg-brand-50' : 'bg-brand-900',
        'dark:bg-media',
        props.className,
      )}
      style={
        props.backgroundImage
          ? { backgroundImage: props.backgroundImage }
          : null
      }
    >
      {Boolean(props.context) && (
        <div
          data-testid="landing-hero-overlay"
          aria-hidden="true"
          className={classNames(
            'absolute inset-0 pointer-events-none',
            isLight
              ? 'bg-primary/60'
              : isAccent
                ? 'bg-brand-100/60'
                : 'bg-brand-900/40',
            'dark:bg-media/40',
          )}
        />
      )}
      <div className="relative flex h-58 w-full items-center justify-center">
        <div className="w-full max-w-200 mx-auto text-center px-4">
          <h2 className={classNames('text-3xl font-medium mb-0', headingColor)}>
            {props.header}
          </h2>
          {/* text-4xl brings its own 40px line height; the heading always had
              the inherited 1.2. */}
          <h1
            className={classNames(
              'text-4xl leading-[1.2] font-medium mb-5',
              headingColor,
            )}
          >
            {props.title}
          </h1>
          {/* The search field keeps the default input look: the legacy
              stylesheet's search rules never won over the field's own
              utilities, so users have only ever seen the default. */}
          {props.children && (
            <div
              data-testid="landing-hero-search-slot"
              className="flex flex-col items-center"
            >
              {props.children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

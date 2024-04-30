import classNames from 'classnames';
import { ReactNode } from 'react';

import { Image } from '@waldur/core/Image';
import './DashboardHeroLogo.scss';
import { SVGImagePlaceholder } from '@waldur/core/SVGImagePlaceholder';

interface DashboardHeroLogoProps {
  logo: string;
  logoAlt?: string;
  logoTopLabel?: ReactNode;
  logoBottomLabel?: ReactNode;
  logoTopClass?: string;
  logoBottomClass?: string;
}

export const DashboardHeroLogo = (props: DashboardHeroLogoProps) => {
  return (
    <div className="dashboard-hero-logo d-flex flex-column align-items-center justify-content-center">
      {props.logo ? (
        <Image src={props.logo} size={100} isContain />
      ) : (
        <SVGImagePlaceholder
          width={100}
          height={100}
          text={props.logoAlt ? props.logoAlt[0] : ''}
          fontSize={60}
        />
      )}
      {props.logoTopLabel && (
        <span
          className={classNames(
            'dashboard-small-label top-label',
            props.logoTopClass,
          )}
        >
          {props.logoTopLabel}
        </span>
      )}
      {props.logoBottomLabel && (
        <span
          className={classNames(
            'dashboard-small-label bottom-label',
            props.logoBottomClass,
          )}
        >
          {props.logoBottomLabel}
        </span>
      )}
    </div>
  );
};

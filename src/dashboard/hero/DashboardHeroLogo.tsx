import classNames from 'classnames';
import PlaceholderImage from 'react-simple-svg-placeholder';

import { Image } from '@waldur/core/Image';
import './DashboardHeroLogo.scss';

interface DashboardHeroLogoProps {
  logo: string;
  logoAlt?: string;
  logoTopLabel?: string;
  logoBottomLabel?: string;
  logoTopClass?: string;
  logoBottomClass?: string;
}

export const DashboardHeroLogo = (props: DashboardHeroLogoProps) => {
  return (
    <div
      className="dashboard-hero-logo d-flex align-items-center justify-content-center"
      style={{ width: 150 }}
    >
      {props.logo ? (
        <Image src={props.logo} size={100} isContain />
      ) : (
        <PlaceholderImage
          width={100}
          height={100}
          text={props.logoAlt[0]}
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

import { FC } from 'react';

import { Image } from '@waldur/core/Image';
import { SVGImagePlaceholder } from '@waldur/core/SVGImagePlaceholder';

interface DashboardHeroLogo2Props {
  logo: string;
  logoAlt?: string;
  size?: number;
  circle?: boolean;
}

export const DashboardHeroLogo2: FC<DashboardHeroLogo2Props> = ({
  size = 100,
  ...props
}) => {
  return (
    <div className="dashboard-hero-logo-2 d-flex flex-column align-items-center">
      {props.logo ? (
        <Image src={props.logo} size={size} isContain circle={props.circle} />
      ) : (
        <SVGImagePlaceholder
          width={size}
          height={size}
          text={props.logoAlt ? props.logoAlt[0] : ''}
          fontSize={60}
          circle={props.circle}
        />
      )}
    </div>
  );
};

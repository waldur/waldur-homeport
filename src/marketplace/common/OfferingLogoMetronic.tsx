import React, { useMemo } from 'react';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { getAbbreviation } from '@waldur/core/utils';
import './OfferingLogo.scss';

interface OfferingLogoProps
  extends Partial<Pick<JSX.IntrinsicElements['img'], 'style'>> {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const OfferingLogo: React.FC<OfferingLogoProps> = (props) => {
  const abbreviation = useMemo(
    () => getAbbreviation(props.name).substr(0, 4),
    [props.name],
  );

  return props.src ? (
    <div
      className={`symbol symbol-${props.size}px marketplace-offering-logo-metronic ${props.className}`}
      style={props.style}
      onClick={props.onClick}
      aria-hidden="true"
    >
      <div
        className="symbol-label image"
        style={{ backgroundImage: `url(${props.src})` }}
      ></div>
    </div>
  ) : (
    <div className="symbol">
      <ImagePlaceholder
        width={`${props.size}px`}
        height={`${props.size}px`}
        backgroundColor="#e2e2e2"
      >
        {abbreviation && (
          <div className="symbol-label fs-6 fw-bold">{abbreviation}</div>
        )}
      </ImagePlaceholder>
    </div>
  );
};

OfferingLogo.defaultProps = {
  size: 75,
};

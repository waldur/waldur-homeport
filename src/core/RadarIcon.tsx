import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC, isValidElement, ReactNode } from 'react';
import { Variant } from 'react-bootstrap/types';

interface RadarIconProps {
  IconComponent: Icon | ReactNode;
  variant?: Variant;
  solid?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  className?: string;
  style?: CSSProperties;
}

export const RadarIcon: FC<RadarIconProps> = ({
  IconComponent,
  variant = 'success',
  solid,
  size,
  className,
  style,
}) => (
  <div
    className={classNames(
      'radar-icon icon-' + variant,
      solid && 'radar-icon-solid',
      size && `radar-icon-${size}`,
      className,
    )}
    style={style}
  >
    <div>
      {isValidElement(IconComponent)
        ? IconComponent
        : renderIcon(IconComponent as Icon, variant)}
    </div>
  </div>
);

const renderIcon = (IconComponent: Icon, variant) => (
  <IconComponent weight="bold" className={`text-${variant}`} />
);

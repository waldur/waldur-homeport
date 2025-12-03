import { Icon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { CSSProperties, FC, isValidElement, ReactNode } from 'react';
import { Variant } from 'react-bootstrap/types';

interface FeaturedIconProps {
  IconComponent: Icon | ReactNode;
  variant?: Variant;
  solid?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  className?: string;
  style?: CSSProperties;
}

export const FeaturedIcon: FC<FeaturedIconProps> = ({
  IconComponent,
  variant = 'success',
  solid,
  size,
  className,
  style,
}) => (
  <div
    className={classNames(
      'featured-icon icon-' + variant,
      solid && 'featured-icon-solid',
      size && `featured-icon-${size}`,
      className,
    )}
    style={style}
  >
    <div>
      {isValidElement(IconComponent)
        ? IconComponent
        : featuredIcon(IconComponent as Icon, variant)}
    </div>
  </div>
);

const featuredIcon = (IconComponent: Icon, variant) => (
  <IconComponent weight="bold" className={`text-${variant}`} />
);

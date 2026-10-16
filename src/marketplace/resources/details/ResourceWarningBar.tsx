import { Icon, WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { PropsWithChildren, ReactNode } from 'react';

import { FeaturedIcon } from 'waldur-ui';

import '@/user/OfferingUsersWarningBar.scss';

interface ResourceWarningBarProps extends PropsWithChildren {
  actions?: ReactNode;
  className?: string;
  icon?: Icon;
}

export const ResourceWarningBar: React.FC<ResourceWarningBarProps> = ({
  children,
  actions,
  className,
  icon = WarningCircleIcon,
}) => {
  const IconComponent = icon;

  return (
    <div className={classNames('resource-warning-bar', className)}>
      <div className="container-fluid">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            {IconComponent && (
              <FeaturedIcon
                icon={<IconComponent weight="bold" />}
                variant="warning"
                size="sm"
              />
            )}
            <div className="ms-2 resource-warning-bar__content">{children}</div>
          </div>
          {actions && <div className="ms-3 flex items-center">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

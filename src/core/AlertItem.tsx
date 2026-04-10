import {
  InfoIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { FeaturedIcon } from './FeaturedIcon';

import './AlertItem.scss';

interface AlertItemProps {
  title: ReactNode;
  titleAfter?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  variant?: 'info' | 'warning' | 'error';
  type?: 'full-width' | 'floating';
  className?: string;
}

const ALERT_ICON = {
  info: { icon: InfoIcon, variant: 'default' },
  warning: { icon: WarningCircleIcon, variant: 'warning' },
  error: { icon: WarningOctagonIcon, variant: 'danger' },
};

export const AlertItem: FC<AlertItemProps> = ({
  title,
  titleAfter,
  body,
  actions,
  variant = 'info',
  type = 'full-width',
  className,
}) => {
  return (
    <div
      className={classNames(
        'alert-item',
        type === 'floating' && 'alert-item-floating',
        className,
      )}
    >
      {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
      <FeaturedIcon
        IconComponent={ALERT_ICON[variant].icon}
        size="lg"
        variant={ALERT_ICON[variant].variant}
        className="alert-icon"
      />
      <div className="flex-grow-1">
        <div className="d-flex align-items-center flex-wrap gap-8px mb-4px">
          <h6 className="mb-0 fw-bold lh-base">{title}</h6>
          {titleAfter}
        </div>
        {Boolean(body) && <div className="text-muted fs-6">{body}</div>}
      </div>
      {Boolean(actions) && <div className="alert-actions gap-4">{actions}</div>}
    </div>
  );
};

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  id?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  cardBordered?: boolean;
}

export const Panel: React.FC<PropsWithChildren<PanelProps>> = ({
  title,
  subtitle,
  id,
  children,
  className,
  bodyClassName,
  titleClassName,
  subtitleClassName,
  cardBordered,
  actions,
}) => (
  <div
    className={classNames('card', cardBordered && 'card-bordered', className)}
    id={id}
  >
    {title && (
      <div className="card-header">
        <div className="flex flex-col">
          <div className="card-title mb-0">
            <h3 className={titleClassName}>{title}</h3>
          </div>
          {subtitle && (
            <div
              className={classNames(
                'card-subtitle text-quaternary mt-1',
                subtitleClassName,
              )}
            >
              <p className="text-sm mb-0">{subtitle}</p>
            </div>
          )}
        </div>
        {/* Never wider than the header, so a wide toolbar (e.g. a scrollable
            tab strip) wraps or scrolls instead of overflowing the card. */}
        <div className="card-toolbar max-w-full">{actions}</div>
      </div>
    )}
    <div className={classNames('card-body', bodyClassName)}>{children}</div>
  </div>
);

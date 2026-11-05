import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from 'waldur-ui';

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
  <Card bordered={cardBordered} className={className} id={id}>
    {title && (
      <CardHeader>
        <div className="flex flex-col">
          <CardTitle as="div" className="mb-0">
            <h3 className={titleClassName}>{title}</h3>
          </CardTitle>
          {subtitle && (
            <div
              className={classNames('text-quaternary mt-1', subtitleClassName)}
            >
              <p className="text-sm mb-0">{subtitle}</p>
            </div>
          )}
        </div>
        {/* Never wider than the header, so a wide toolbar (e.g. a scrollable
            tab strip) wraps or scrolls instead of overflowing the card. */}
        <CardToolbar className="max-w-full">{actions}</CardToolbar>
      </CardHeader>
    )}
    <CardContent className={bodyClassName}>{children}</CardContent>
  </Card>
);

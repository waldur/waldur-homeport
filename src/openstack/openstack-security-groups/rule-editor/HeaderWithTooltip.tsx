import { FC } from 'react';

import { HelpIcon, TableHead } from 'waldur-ui';

interface HeaderWithTooltipProps {
  label: string;
  tooltip: string;
  className?: string;
}

export const HeaderWithTooltip: FC<HeaderWithTooltipProps> = ({
  label,
  tooltip,
  className,
}) => (
  <TableHead className={className}>
    <div className="flex items-center">
      <span className="me-1.5">{label}</span>
      <HelpIcon label={tooltip} />
    </div>
  </TableHead>
);

import { FC } from 'react';

import { HelpIcon } from 'waldur-ui';

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
  <th className={className}>
    <div className="d-flex align-items-center">
      <span className="me-2">{label}</span>
      <HelpIcon label={tooltip} />
    </div>
  </th>
);

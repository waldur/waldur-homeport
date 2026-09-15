import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

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
      <Tooltip label={tooltip}>
        <QuestionIcon weight="bold" />
      </Tooltip>
    </div>
  </th>
);

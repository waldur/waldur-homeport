import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

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
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={label}>{tooltip}</Tooltip>}
      >
        <span>
          <QuestionIcon weight="bold" />
        </span>
      </OverlayTrigger>
    </div>
  </th>
);

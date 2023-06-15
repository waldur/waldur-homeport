import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import SVG from 'react-inlinesvg';

type Props = {
  className?: string;
  path: string;
  svgClassName?: string;
  tooltipText?: string;
  tooltipClassName?: string;
};

const InlineSVG: React.FC<Props> = ({
  className = '',
  path,
  svgClassName = 'mh-50px',
  tooltipText = '',
  tooltipClassName = '',
}) => {
  const tooltip = (
    <Tooltip id="tooltip" className={tooltipClassName}>
      <strong>{tooltipText}</strong>
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <span className={`svg-icon ${className}`}>
        <SVG src={path} className={svgClassName} />
      </span>
    </OverlayTrigger>
  );
};

export { InlineSVG };

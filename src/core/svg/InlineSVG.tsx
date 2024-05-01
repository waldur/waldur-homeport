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

const SvgIcon = (props: Pick<Props, 'className' | 'path' | 'svgClassName'>) => (
  <span className={`svg-icon ${props.className}`}>
    <SVG src={props.path} className={props.svgClassName} />
  </span>
);

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
      <SvgIcon path={path} className={className} svgClassName={svgClassName} />
    </OverlayTrigger>
  );
};

export { InlineSVG, SvgIcon };

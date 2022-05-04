import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';

import { Tip } from '@waldur/core/Tooltip';

export interface StateIndicatorProps {
  label: string;
  tooltip?: string;
  variant: Variant;
  striped?: boolean;
  active?: boolean;
}

const wrapTooltip = (label, children) =>
  label ? (
    <Tip label={label} id="state-indicator">
      {children}
    </Tip>
  ) : (
    children
  );

export const StateIndicator: FunctionComponent<StateIndicatorProps> = (props) =>
  wrapTooltip(
    props.tooltip,
    <Badge bg={props.variant} className="fs-8 fw-bolder">
      {props.label.toUpperCase()}
    </Badge>,
  );

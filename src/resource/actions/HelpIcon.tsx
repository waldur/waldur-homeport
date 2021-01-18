import { FunctionComponent } from 'react';
import { OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';

export const HelpIcon: FunctionComponent<{ helpText }> = ({ helpText }) =>
  helpText ? (
    <OverlayTrigger
      placement="top"
      overlay={
        <BootstrapTooltip
          id="help-icon"
          className="select-workspace-dialog__tooltip--order"
        >
          {helpText}
        </BootstrapTooltip>
      }
    >
      <i className="fa fa-question-circle" aria-hidden="true" />
    </OverlayTrigger>
  ) : null;

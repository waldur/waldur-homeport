import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import './RequestedEmail.scss';
import { StaticField } from './StaticField';

interface RequestedEmailProps {
  requestedEmail: string;
  onCancelRequest(): void;
  waiting: boolean;
}

export const RequestedEmail: FunctionComponent<RequestedEmailProps> = (
  props,
) => (
  <div id="requested-email-container">
    <StaticField
      label={translate('Requested email')}
      value={props.requestedEmail}
    />
    <label className="col-sm-3 col-md-4 col-lg-3" />
    <div className="col-sm-9 col-md-8">
      <Button id="cancel-request-btn" onClick={props.onCancelRequest}>
        {props.waiting && (
          <i className="fa fa-spinner fa-spin m-r-xs spinner" />
        )}
        {translate('Cancel request')}
      </Button>
    </div>
  </div>
);

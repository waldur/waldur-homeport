import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';

import { translate } from '@waldur/i18n';

import { StaticField } from './StaticField';
import './RequestedEmail.scss';

interface RequestedEmailProps {
  requestedEmail: string;
  onCancelRequest(): void;
  waiting: boolean;
}

export const RequestedEmail = (props: RequestedEmailProps) => (
  <div id="requested-email-container">
    <StaticField
      label={translate('Requested email')}
      value={props.requestedEmail}
    />
    <label className="col-sm-3 col-md-4 col-lg-3">{translate('')}</label>
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

import { FunctionComponent } from 'react';
import { Panel } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';

export const BackupScheduleWarning: FunctionComponent = () => (
  <Panel id="backup-schedule-message">
    <Panel.Heading>
      <Panel.Title toggle={true}>
        <i className="fa fa-warning" />{' '}
        {translate('VM snapshot schedule caveats')}
      </Panel.Title>
    </Panel.Heading>
    <Panel.Collapse>
      <Panel.Body>
        <FormattedHtml html={require('./BackupScheduleWarning.md')} />
      </Panel.Body>
    </Panel.Collapse>
  </Panel>
);

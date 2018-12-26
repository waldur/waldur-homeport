import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';

import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

const BackupScheduleWarning = () => (
  <Panel id="backup-schedule-message">
    <Panel.Heading>
      <Panel.Title toggle={true}>
        <i className="fa fa-warning"/>
        {' '}
        {translate('Backup schedule caveats')}
      </Panel.Title>
    </Panel.Heading>
    <Panel.Collapse>
      <Panel.Body>
        <div dangerouslySetInnerHTML={{__html: require('./BackupScheduleWarning.md')}}/>
      </Panel.Body>
    </Panel.Collapse>
  </Panel>
);

export default connectAngularComponent(BackupScheduleWarning);

import * as React from 'react';

import Panel from '@waldur/core/Panel';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingReportComponent } from './OfferingReportComponent';

const reportWithoutSnapshots = report =>
  report.filter(section => section.header !== 'Snapshots');

const OracleReport = props => (
  <Panel title="Report">
    <OfferingReportComponent report={reportWithoutSnapshots(props.report)}/>
  </Panel>
);

export default connectAngularComponent(OracleReport, ['report']);

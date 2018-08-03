import * as React from 'react';

import Panel from '@waldur/core/Panel';

import { OfferingReportComponent } from './OfferingReportComponent';

const reportWithoutSnapshots = report =>
  report.filter(section => section.header.toLowerCase() !== 'snapshots');

export const OracleReport = props => (
  <Panel title="Report">
    <OfferingReportComponent report={reportWithoutSnapshots(props.report)}/>
  </Panel>
);

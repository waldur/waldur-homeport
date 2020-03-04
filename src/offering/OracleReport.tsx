import * as React from 'react';

import { OfferingReportComponent } from './OfferingReportComponent';

const reportWithoutSnapshots = report =>
  report.filter(section => section.header.toLowerCase() !== 'snapshots');

export const OracleReport = props => (
  <OfferingReportComponent report={reportWithoutSnapshots(props.report)} />
);

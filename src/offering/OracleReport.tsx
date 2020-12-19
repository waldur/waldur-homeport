import { FunctionComponent } from 'react';

import { OfferingReportComponent } from './OfferingReportComponent';

const reportWithoutSnapshots = (report) =>
  report.filter((section) => section.header.toLowerCase() !== 'snapshots');

export const OracleReport: FunctionComponent<any> = (props) => (
  <OfferingReportComponent report={reportWithoutSnapshots(props.report)} />
);

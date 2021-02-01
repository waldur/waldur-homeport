import { FunctionComponent } from 'react';

import { ShowReportComponent } from '@waldur/marketplace/resources/report/ShowReportComponent';
import { Report } from '@waldur/marketplace/resources/types';

const reportWithoutSnapshots = (report: Report) =>
  report.filter((section) => section.header.toLowerCase() !== 'snapshots');

export const OracleReport: FunctionComponent<{ report: Report }> = (props) => (
  <ShowReportComponent report={reportWithoutSnapshots(props.report)} />
);

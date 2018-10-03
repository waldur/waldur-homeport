import * as React from 'react';

import * as Accordion from 'react-bootstrap/lib/Accordion';
import * as Panel from 'react-bootstrap/lib/Panel';

import { Report } from './types';

interface OfferingReportComponentProps {
  report: Report;
}

export const OfferingReportComponent = (props: OfferingReportComponentProps) => (
  // Temporary workaround for typing incompatibility.
  // It allows to open first section of according by default.
  // See also: https://github.com/react-bootstrap/react-bootstrap/issues/2599
  <Accordion {...{defaultActiveKey: 0}}>
    {props.report.map((section, index) => (
      <Panel header={section.header} eventKey={index} key={index}>
        <pre>{section.body}</pre>
      </Panel>
    ))}
  </Accordion>
);

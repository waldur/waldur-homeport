import * as React from 'react';

import * as Accordion from 'react-bootstrap/lib/Accordion';
import * as Panel from 'react-bootstrap/lib/Panel';

import { Report } from './types';

interface OfferingReportComponentProps {
  report: Report;
}

export const OfferingReportComponent = (props: OfferingReportComponentProps) => (
  <Accordion defaultExpanded={true}>
    {props.report.map((section, index) => (
      <Panel eventKey={index} key={index}>
        <Panel.Heading>{section.header}</Panel.Heading>
        <pre>{section.body}</pre>
      </Panel>
    ))}
  </Accordion>
);

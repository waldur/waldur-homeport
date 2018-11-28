import * as React from 'react';

import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';

import { Report } from './types';

interface OfferingReportComponentProps {
  report: Report;
}

export const OfferingReportComponent = (props: OfferingReportComponentProps) => (
  <PanelGroup accordion={true} defaultActiveKey={0} id="oracle-report">
    {props.report.map((section, index) => (
      <Panel eventKey={index} key={index}>
        <Panel.Heading>
          <Panel.Title toggle={true}>
            {section.header}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible={true}>
          <pre>{section.body}</pre>
        </Panel.Body>
      </Panel>
    ))}
  </PanelGroup>
);

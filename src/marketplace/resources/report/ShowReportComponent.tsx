import { FunctionComponent } from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Report } from '@waldur/marketplace/resources/types';

interface ShowReportComponentProps {
  report: Report;
}

export const ShowReportComponent: FunctionComponent<ShowReportComponentProps> = (
  props,
) =>
  Array.isArray(props.report) ? (
    <PanelGroup accordion={true} defaultActiveKey={0}>
      {props.report.map((section, index) => (
        <Panel eventKey={index} key={index}>
          <Panel.Heading>
            <Panel.Title toggle={true}>{section.header}</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible={true}>
            <pre>{section.body}</pre>
          </Panel.Body>
        </Panel>
      ))}
    </PanelGroup>
  ) : (
    <>{translate('Report is invalid.')}</>
  );

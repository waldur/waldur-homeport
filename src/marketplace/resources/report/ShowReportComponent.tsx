import { FunctionComponent } from 'react';
import { Accordion } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Report } from '@waldur/marketplace/resources/types';

interface ShowReportComponentProps {
  report: Report;
}

export const ShowReportComponent: FunctionComponent<ShowReportComponentProps> =
  (props) =>
    Array.isArray(props.report) ? (
      <Accordion defaultActiveKey="0">
        {props.report.map((section, index) => (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header>{section.header}</Accordion.Header>
            <Accordion.Body>
              <pre>{section.body}</pre>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    ) : (
      <>{translate('Report is invalid.')}</>
    );

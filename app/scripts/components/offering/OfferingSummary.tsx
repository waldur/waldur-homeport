import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { IssueCommentsContainer } from '@waldur/issues/comments/IssueCommentsContainer';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingTabs } from './OfferingTabs';
import { OracleReport } from './OracleReport';
import { OracleSnapshots } from './OracleSnapshots';
import { Offering } from './types';
import { isOracleOffering } from './utils';

interface OfferingSummary {
  offering: Offering;
  summary?: string;
}

const OfferingSummary = props => {
  const issue = {
    uuid: props.offering.issue_uuid,
    url: props.offering.issue,
  };
  const showOracleReport = isOracleOffering(props.offering) && props.offering.report;

  return (
    <Row className="m-t-md">
      <Col sm={6}>
        <OfferingTabs offering={props.offering} summary={props.summary} />
        {showOracleReport && <OracleSnapshots report={props.offering.report}/>}
      </Col>
      <Col sm={6}>
        {showOracleReport && <OracleReport report={props.offering.report}/>}
        {props.offering.issue && <IssueCommentsContainer issue={issue}/>}
      </Col>
    </Row>
  );
};

export default connectAngularComponent(OfferingSummary, ['offering', 'summary']);

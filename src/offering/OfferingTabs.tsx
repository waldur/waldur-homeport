import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as Row from 'react-bootstrap/lib/Row';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import { connect } from 'react-redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { IssueCommentsContainer } from '@waldur/issues/comments/IssueCommentsContainer';
import { ResourceOrderItems } from '@waldur/marketplace/orders/item/list/ResourceOrderItems';
import { isVisible } from '@waldur/store/config';

import { OfferingEvents } from './OfferingEvents';
import { OfferingSummaryTab } from './OfferingSummaryTab';
import { OracleReport } from './OracleReport';
import { OracleSnapshots } from './OracleSnapshots';
import { Offering } from './types';
import { isOracleOffering } from './utils';

interface OwnProps {
  offering: Offering;
  summary: string;
}

interface StateProps {
  showComments: boolean;
}

type OfferingTabsProps = OwnProps & TranslateProps & StateProps;

export const PureOfferingTabs: React.SFC<OfferingTabsProps > = props => {
  const issue = {
    uuid: props.offering.issue_uuid,
    url: props.offering.issue,
  };
  const showOracleReport = isOracleOffering(props.offering) && props.offering.report;
  const Summary = showOracleReport ? (
    <Row>
      <Col md={6}>
        <div className="m-b-md">
          <OfferingSummaryTab offering={props.offering} summary={props.summary}/>
        </div>
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              {props.translate('Snapshots')}
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <OracleSnapshots report={props.offering.report}/>
          </Panel.Body>
        </Panel>
      </Col>
      <Col md={6}>
        <OracleReport report={props.offering.report}/>
      </Col>
    </Row>
  ) : (
    <OfferingSummaryTab offering={props.offering} summary={props.summary}/>
  );
  return (
    <Tabs unmountOnExit={true} defaultActiveKey="summary" id="offeringSummary">
      <Tab title={props.translate('Summary')} eventKey="summary">
        <div className="m-t-sm">
          {Summary}
        </div>
      </Tab>
      <Tab title={props.translate('Audit log')} eventKey="events">
        <div className="m-t-sm">
          <OfferingEvents offering={props.offering}/>
        </div>
      </Tab>
      {props.showComments && (
        <Tab title={props.translate('Comments')} eventKey="comments">
          <div className="m-t-sm">
            <IssueCommentsContainer issue={issue} renderHeader={false}/>
          </div>
        </Tab>
      )}
      {props.offering.marketplace_resource_uuid && (
        <Tab title={props.translate('Order items')} eventKey="order-items">
          <div className="m-t-sm">
            <ResourceOrderItems resource_uuid={props.offering.marketplace_resource_uuid}/>
          </div>
        </Tab>
      )}
    </Tabs>
  );
};

const connector = connect<StateProps, {}, OwnProps>((state, ownProps) => ({
  showComments: isVisible(state, 'offering.comments') &&
    Boolean(ownProps.offering.issue && ownProps.offering.issue_key),
}));

export const OfferingTabs = withTranslation(connector(PureOfferingTabs)) as React.ComponentType<OwnProps>;

import React from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { IssueCommentsContainer } from '@waldur/issues/comments/IssueCommentsContainer';
import { Issue } from '@waldur/issues/list/types';
import { ResourceOrderItems } from '@waldur/marketplace/orders/item/list/ResourceOrderItems';
import { Resource } from '@waldur/marketplace/resources/types';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { SupportEvents } from './SupportEvents';
import { SupportSummaryTab } from './SupportSummaryTab';

interface OwnProps {
  resource: Resource;
  summary: string;
  issue?: Issue;
}

interface StateProps {
  showComments: boolean;
}

type SupportTabsProps = OwnProps & StateProps;

export const PureSupportTabs: React.FC<SupportTabsProps> = (props) => {
  return (
    <Tabs
      mountOnEnter
      unmountOnExit
      defaultActiveKey="summary"
      id="offeringSummary"
    >
      <Tab title={translate('Summary')} eventKey="summary">
        <Card>
          <SupportSummaryTab issue={props.issue} summary={props.summary} />
        </Card>
      </Tab>
      <Tab title={translate('Audit log')} eventKey="events">
        <Card>
          <SupportEvents resource={props.resource} />
        </Card>
      </Tab>
      {props.showComments && (
        <Tab title={translate('Comments')} eventKey="comments">
          <Card>
            <IssueCommentsContainer issue={props.issue} renderHeader={false} />
          </Card>
        </Tab>
      )}
      {props.resource.uuid && (
        <Tab title={translate('Order items')} eventKey="order-items">
          <Card>
            <ResourceOrderItems resource_uuid={props.resource.uuid} />
          </Card>
        </Tab>
      )}
    </Tabs>
  );
};

const connector = connect<StateProps, {}, OwnProps>(
  (state: RootState, ownProps) => ({
    showComments:
      isVisible(state, 'support.offering_comments') &&
      Boolean(ownProps?.issue?.key),
  }),
);

export const SupportTabs = connector(
  PureSupportTabs,
) as React.ComponentType<OwnProps>;

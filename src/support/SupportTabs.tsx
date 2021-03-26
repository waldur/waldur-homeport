import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
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

type SupportTabsProps = OwnProps & TranslateProps & StateProps;

export const PureSupportTabs: React.FC<SupportTabsProps> = (props) => {
  return (
    <Tabs
      mountOnEnter
      unmountOnExit
      defaultActiveKey="summary"
      id="offeringSummary"
      animation={false}
    >
      <Tab title={props.translate('Summary')} eventKey="summary">
        <div className="m-t-sm">
          <SupportSummaryTab issue={props.issue} summary={props.summary} />
        </div>
      </Tab>
      <Tab title={props.translate('Audit log')} eventKey="events">
        <div className="m-t-sm">
          <SupportEvents resource={props.resource} />
        </div>
      </Tab>
      {props.showComments && (
        <Tab title={props.translate('Comments')} eventKey="comments">
          <div className="m-t-sm">
            <IssueCommentsContainer issue={props.issue} renderHeader={false} />
          </div>
        </Tab>
      )}
      {props.resource.uuid && (
        <Tab title={props.translate('Order items')} eventKey="order-items">
          <div className="m-t-sm">
            <ResourceOrderItems resource_uuid={props.resource.uuid} />
          </div>
        </Tab>
      )}
    </Tabs>
  );
};

const connector = connect<StateProps, {}, OwnProps>(
  (state: RootState, ownProps) => ({
    showComments:
      isVisible(state, 'offering.comments') && Boolean(ownProps?.issue?.key),
  }),
);

export const SupportTabs = withTranslation(
  connector(PureSupportTabs),
) as React.ComponentType<OwnProps>;

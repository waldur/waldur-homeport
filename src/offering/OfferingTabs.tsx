import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { IssueCommentsContainer } from '@waldur/issues/comments/IssueCommentsContainer';

import { OfferingEvents } from './OfferingEvents';
import { OfferingSummaryTab } from './OfferingSummaryTab';
import { OracleReport } from './OracleReport';
import { OracleSnapshots } from './OracleSnapshots';
import { Offering } from './types';
import { isOracleOffering } from './utils';

interface OfferingTabsProps extends TranslateProps {
  offering: Offering;
  summary: string;
}

export const PureOfferingTabs = (props: OfferingTabsProps) => {
  const issue = {
    uuid: props.offering.issue_uuid,
    url: props.offering.issue,
  };
  const showOracleReport = isOracleOffering(props.offering) && props.offering.report;
  return (
    <Tabs unmountOnExit={true} defaultActiveKey="summary" id="offeringSummary">
      <Tab title={props.translate('Summary')} eventKey="summary">
        <div className="m-t-sm">
          <OfferingSummaryTab offering={props.offering} summary={props.summary}/>
        </div>
      </Tab>
      <Tab title={props.translate('Audit log')} eventKey="events">
        <div className="m-t-sm">
          <OfferingEvents offering={props.offering}/>
        </div>
      </Tab>
      {props.offering.issue && (
        <Tab title={props.translate('Comments')} eventKey="comments">
          <div className="m-t-sm">
            <IssueCommentsContainer issue={issue} renderHeader={false}/>
          </div>
        </Tab>
      )}
      {showOracleReport && (
        <Tab title={props.translate('Report')} eventKey="report">
          <div className="m-t-sm">
            <OracleReport report={props.offering.report}/>
          </div>
        </Tab>
      )}
      {showOracleReport && (
        <Tab title={props.translate('Snapshots')} eventKey="snapshots">
          <div className="m-t-sm">
            <OracleSnapshots report={props.offering.report}/>}
          </div>
        </Tab>
      )}
    </Tabs>
  );
};

export const OfferingTabs = withTranslation(PureOfferingTabs);

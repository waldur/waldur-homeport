import { FunctionComponent } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/details/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { OneTimeTab } from './OneTimeTab';
import { PeriodicTab } from './PeriodicTab';
import { PlanDetailsTableProps, PricesData } from './types';
import { pricesSelector, useComponentsDetailPrices } from './utils';
import { WarningTooltip } from './WarningTooltip';

import './TabbedPlanComponents.scss';

const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (props) => {
  if (props.components.length === 0) {
    return null;
  }

  const { periodic, oneTime } = useComponentsDetailPrices(props);

  const currentCustomer = useSelector(getCustomer);
  const customer = props.customer || currentCustomer;

  if (!periodic.hasPeriodicCost && !oneTime.hasOneTimeCost) {
    return null;
  }

  return (
    <div className="plan-details-container">
      <Tab.Container
        defaultActiveKey={oneTime.hasOneTimeCost ? 'onetime' : 'periodic'}
      >
        {/* TABS */}
        <Nav variant="tabs" className="nav-line-tabs">
          {props.extraTabs
            ? props.extraTabs.map((tab) => (
                <Nav.Item key={tab.eventKey}>
                  <Nav.Link eventKey={tab.eventKey}>{tab.title}</Nav.Link>
                </Nav.Item>
              ))
            : null}
          {oneTime.hasOneTimeCost ? (
            <Nav.Item>
              <Nav.Link eventKey="onetime">
                {translate('One time cost')}
              </Nav.Link>
            </Nav.Item>
          ) : null}
          {periodic.hasPeriodicCost ? (
            <Nav.Item>
              <Nav.Link eventKey="periodic">
                {translate('Monthly cost')}
              </Nav.Link>
            </Nav.Item>
          ) : null}
          <WarningTooltip />
        </Nav>

        {/* CONTENT */}
        <Tab.Content>
          {props.extraTabs
            ? props.extraTabs.map((tab) => (
                <Tab.Pane key={tab.eventKey} eventKey={tab.eventKey}>
                  <tab.component />
                </Tab.Pane>
              ))
            : null}
          {oneTime.hasOneTimeCost ? (
            <Tab.Pane eventKey="onetime">
              <OneTimeTab oneTime={oneTime} viewMode={props.viewMode} />
            </Tab.Pane>
          ) : null}

          {periodic.hasPeriodicCost ? (
            <Tab.Pane eventKey="periodic">
              <PeriodicTab
                periodic={periodic}
                customer={customer}
                viewMode={props.viewMode}
                periodKeys={props.periodKeys}
                periods={props.periods}
              />
            </Tab.Pane>
          ) : null}
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

interface TabbedPlanComponents {
  offering: PublicOfferingDetails;
  plan?: BasePublicPlan;
  limits?: Limits;
  viewMode?: boolean;
}

export const TabbedPlanComponents = connect<
  PricesData,
  {},
  TabbedPlanComponents
>(pricesSelector)(PureDetailsTable);

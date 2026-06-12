import { ComponentType, FunctionComponent, ReactNode } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  BasePublicPlan,
  Customer,
  LimitPeriodEnum,
  PublicOfferingDetails,
  Offering,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/details/types';

import { OneTimeTab } from './OneTimeTab';
import { PeriodicTab } from './PeriodicTab';
import { PlanDetailsTableProps } from './types';
import {
  LIMIT_PERIODS,
  useComponentsDetailPrices,
  useOrderPrices,
} from './utils';
import { WarningTooltip } from './WarningTooltip';

import './TabbedPlanComponents.scss';

const COST_TAB_LABEL: Partial<Record<LimitPeriodEnum, string>> = {
  month: translate('Monthly cost'),
  quarterly: translate('Quarterly cost'),
  annual: translate('Annual cost'),
  total: translate('One time cost'),
};

const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (props) => {
  if (props.components.length === 0) {
    return null;
  }

  const { periodic, oneTime } = useComponentsDetailPrices(props);

  const globalConceal = isFeatureVisible(MarketplaceFeatures.conceal_prices);
  const shouldConcealPrices = globalConceal || props.concealBillingInfo;

  if (!periodic.hasPeriodicCost && !oneTime.hasOneTimeCost) {
    return null;
  }

  const customer = props.customer;

  const canShowTab = (period: LimitPeriodEnum) =>
    periodic.limitedRowsByPeriod[period].rows.length > 0 ||
    (period === 'month' && periodic.hasMonthlyCost);

  if (shouldConcealPrices) {
    return (
      <div className="plan-details-container">
        {oneTime.hasOneTimeCost && (
          <OneTimeTab
            oneTime={oneTime}
            viewMode={props.viewMode}
            concealBillingInfo
            offering={props.offering}
          />
        )}
        {periodic.hasPeriodicCost &&
          LIMIT_PERIODS.map(
            (period) =>
              canShowTab(period) && (
                <PeriodicTab
                  key={period}
                  periodic={periodic}
                  limitPeriod={period}
                  customer={customer}
                  viewMode={props.viewMode}
                  periodKeys={props.periodKeys}
                  periods={props.periods}
                  concealBillingInfo
                  offering={props.offering}
                />
              ),
          )}
      </div>
    );
  }

  const defaultActiveKey = oneTime.hasOneTimeCost
    ? 'onetime'
    : 'periodic-' + LIMIT_PERIODS.find((per) => canShowTab(per));

  return (
    <div className="plan-details-container">
      <Tab.Container defaultActiveKey={defaultActiveKey}>
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
              <Nav.Link eventKey="onetime">{COST_TAB_LABEL['total']}</Nav.Link>
            </Nav.Item>
          ) : null}
          {periodic.hasPeriodicCost
            ? LIMIT_PERIODS.map(
                (period) =>
                  canShowTab(period) && (
                    <Nav.Item key={period}>
                      <Nav.Link eventKey={`periodic-${period}`}>
                        {COST_TAB_LABEL[period]}
                      </Nav.Link>
                    </Nav.Item>
                  ),
              )
            : null}
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
              <OneTimeTab
                oneTime={oneTime}
                viewMode={props.viewMode}
                concealBillingInfo={props.concealBillingInfo}
                offering={props.offering}
              />
            </Tab.Pane>
          ) : null}

          {periodic.hasPeriodicCost
            ? LIMIT_PERIODS.map(
                (period) =>
                  canShowTab(period) && (
                    <Tab.Pane key={period} eventKey={`periodic-${period}`}>
                      <PeriodicTab
                        periodic={periodic}
                        limitPeriod={period}
                        customer={customer}
                        viewMode={props.viewMode}
                        periodKeys={props.periodKeys}
                        periods={props.periods}
                        concealBillingInfo={props.concealBillingInfo}
                        offering={props.offering}
                      />
                    </Tab.Pane>
                  ),
              )
            : null}
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

interface TabbedPlanComponents {
  offering: PublicOfferingDetails | Offering;
  plan?: BasePublicPlan;
  limits?: Limits;
  viewMode?: boolean;
  concealBillingInfo?: boolean;
  customer?: Pick<Customer, 'url'>;
  extraTabs?: Array<{
    title: ReactNode;
    eventKey: string | number;
    component: ComponentType;
  }>;
}

export const TabbedPlanComponents = (props: TabbedPlanComponents) => {
  const prices = useOrderPrices(props);
  return <PureDetailsTable {...props} {...prices} />;
};

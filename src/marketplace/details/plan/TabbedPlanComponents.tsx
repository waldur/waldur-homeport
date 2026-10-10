import { ComponentType, FunctionComponent, ReactNode } from 'react';
import { Form } from 'react-final-form';
import {
  BasePublicPlan,
  Customer,
  LimitPeriodEnum,
  PublicOfferingDetails,
  Offering,
} from 'waldur-js-client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

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

// A stable no-op submit for the inert read-only Form (see TabbedPlanComponents).
const NOOP_SUBMIT = () => undefined;

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
                  readOnlyLimits={props.readOnlyLimits}
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

  const tabs: Array<{
    eventKey: string;
    title: ReactNode;
    content: ReactNode;
  }> = [
    ...(props.extraTabs || []).map((tab) => ({
      eventKey: tab.eventKey,
      title: tab.title,
      content: <tab.component />,
    })),
    ...(oneTime.hasOneTimeCost
      ? [
          {
            eventKey: 'onetime',
            title: COST_TAB_LABEL['total'],
            content: (
              <OneTimeTab
                oneTime={oneTime}
                viewMode={props.viewMode}
                concealBillingInfo={props.concealBillingInfo}
                offering={props.offering}
              />
            ),
          },
        ]
      : []),
    ...(periodic.hasPeriodicCost
      ? LIMIT_PERIODS.filter(canShowTab).map((period) => ({
          eventKey: `periodic-${period}`,
          title: COST_TAB_LABEL[period],
          content: (
            <PeriodicTab
              periodic={periodic}
              limitPeriod={period}
              customer={customer}
              viewMode={props.viewMode}
              readOnlyLimits={props.readOnlyLimits}
              periodKeys={props.periodKeys}
              periods={props.periods}
              concealBillingInfo={props.concealBillingInfo}
              offering={props.offering}
            />
          ),
        }))
      : []),
  ];

  // A lone "Monthly cost" tab is chrome with no navigational function — the
  // table below already reads "per month" and "/mo" — so its pane is shown
  // directly. Every other label ("One time cost", "Quarterly cost", ...) is the
  // only place its period is named, so those keep the bar even when alone.
  if (tabs.length === 1 && tabs[0].eventKey === 'periodic-month') {
    return (
      <div className="plan-details-container">
        {/* The bar is also where WarningTooltip lives — keep it in edit mode. */}
        {!props.viewMode && (
          <div className="d-flex mb-2">
            <WarningTooltip />
          </div>
        )}
        {tabs[0].content}
      </div>
    );
  }

  return (
    <div className="plan-details-container">
      <Tabs mount="all" defaultValue={defaultActiveKey}>
        {/* TABS — 16px between the bar and the table under it. */}
        <TabsList className="mb-[16px]">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.eventKey} value={tab.eventKey}>
              {tab.title}
            </TabsTrigger>
          ))}
          {/* WarningTooltip reads submit errors via useFormState, so it must
              not render outside a <Form> — e.g. the read-only proposal
              resource-request view passes viewMode with no surrounding form. */}
          {!props.viewMode && <WarningTooltip />}
        </TabsList>

        {/* CONTENT */}
        {/* The first row's own top padding is dropped so the two gaps do not add up to 32px. */}
        <div className="tab-content [&_table.form-table_tr:first-child>*]:pt-0">
          {tabs.map((tab) => (
            <TabsContent key={tab.eventKey} value={tab.eventKey}>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

interface TabbedPlanComponents {
  offering: PublicOfferingDetails | Offering;
  plan?: BasePublicPlan;
  limits?: Limits;
  viewMode?: boolean;
  /** Render the limit quantities without inputs; see ControlRows. */
  readOnlyLimits?: boolean;
  concealBillingInfo?: boolean;
  customer?: Pick<Customer, 'url'>;
  /** Prepaid subscription length, where it is named in months (see PrepaidMonthsMode). */
  prepaidDurationMonths?: number;
  extraTabs?: Array<{
    title: ReactNode;
    eventKey: string;
    component: ComponentType;
  }>;
}

const PlanComponentsBody = (props: TabbedPlanComponents) => {
  const prices = useOrderPrices(props);
  return <PureDetailsTable {...props} {...prices} />;
};

// The plan-components subtree is order-form-oriented: several descendants
// (useOrderPrices, OneTimeTab's useOrderFormData, WarningTooltip) read
// react-final-form state via hooks that throw outside a <Form>. In edit mode an
// order form is always in context. In read-only viewMode (proposal resource
// requests, public offering pricing) there is none, so wrap the subtree in an
// inert Form purely to satisfy those hooks — the displayed values come from
// props, and nothing is editable while viewMode is set.
export const TabbedPlanComponents = (props: TabbedPlanComponents) =>
  props.viewMode ? (
    <Form onSubmit={NOOP_SUBMIT}>
      {() => <PlanComponentsBody {...props} />}
    </Form>
  ) : (
    <PlanComponentsBody {...props} />
  );

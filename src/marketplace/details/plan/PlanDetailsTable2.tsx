import { WarningCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { FieldError } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { formSubmitErrorsSelector } from '@waldur/marketplace/deploy/selectors';
import { concealPricesSelector } from '@waldur/marketplace/deploy/utils';
import { Limits } from '@waldur/marketplace/details/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentEditRow2 } from './ComponentEditRow';
import { ComponentRow2 } from './ComponentRow';
import {
  Component,
  PlanDetailsTableProps,
  PlanPeriod,
  PricesData,
} from './types';
import { UsageComponentRow } from './UsageComponentRow';
import { pricesSelector, useComponentsDetailPrices } from './utils';

import './PlanDetailTable2.scss';

const FixedRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
}) => (
  <>
    {props.components.map((component, index) => (
      <ComponentRow2
        key={index}
        offeringComponent={component}
        hidePrices={props.hidePrices}
        period={props.period}
        activePriceIndex={props.activePriceIndex}
      >
        {translate('Quantity')}: {component.amount}x
      </ComponentRow2>
    ))}
  </>
);

const UsageRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  period?: PlanPeriod;
}) => (
  <>
    {props.components.map((component, index) => (
      <UsageComponentRow
        key={index}
        offeringComponent={component}
        hidePrices={props.hidePrices}
        period={props.period}
      />
    ))}
  </>
);

const ControlRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  viewMode: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
}) =>
  props.viewMode ? (
    <FixedRows
      components={props.components}
      hidePrices={props.hidePrices}
      period={props.period}
      activePriceIndex={props.activePriceIndex}
    />
  ) : (
    <>
      {props.components.map((component, index) => (
        <ComponentEditRow2
          key={index}
          component={component}
          hidePrices={props.hidePrices}
          period={props.period}
          activePriceIndex={props.activePriceIndex}
        />
      ))}
    </>
  );

const ComponentRowTotal = (props: {
  amount: number;
  period?: PlanPeriod;
  setPeriod?;
}) => {
  return (
    <tr className="total">
      <th className="col-md title fs-4 fw-normal">{translate('Total')}</th>
      <td colSpan={2} className="col-md-auto col-actions">
        <div className="d-flex align-items-center justify-content-end gap-4">
          {props.period && props.setPeriod && (
            <AwesomeCheckbox
              label={translate('Yearly estimate')}
              value={props.period === 'monthly' ? false : true}
              size="sm"
              onChange={(value) =>
                props.setPeriod(value ? 'annual' : 'monthly')
              }
            />
          )}
          <span className="fs-4 text-gray-700 min-w-150px text-start">
            {defaultCurrency(props.amount)}
            {Boolean(props.period) && (
              <>
                {' /'}
                {props.period === 'annual' ? 'year' : 'month'}
              </>
            )}
          </span>
        </div>
      </td>
    </tr>
  );
};

const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (props) => {
  if (props.components.length === 0) {
    return null;
  }

  const { periodic, oneTime } = useComponentsDetailPrices(props);
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const shouldConcealPrices = useSelector(concealPricesSelector);

  const activePriceIndex = useMemo(
    () => props.periodKeys.indexOf(selectedPeriod) ?? 0,
    [props.periodKeys, selectedPeriod],
  );

  const submitErrors = useSelector(formSubmitErrorsSelector);

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
          {props.extraTabs &&
            props.extraTabs.map((tab) => (
              <Nav.Item key={tab.eventKey}>
                <Nav.Link eventKey={tab.eventKey}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          {oneTime.hasOneTimeCost && (
            <Nav.Item>
              <Nav.Link eventKey="onetime">
                {translate('One time cost')}
              </Nav.Link>
            </Nav.Item>
          )}
          {periodic.hasPeriodicCost && (
            <Nav.Item>
              <Nav.Link eventKey="periodic">
                {translate('Monthly cost')}
              </Nav.Link>
            </Nav.Item>
          )}
          {submitErrors && 'plan_entries' in submitErrors && (
            <Tip
              label={<FieldError error={submitErrors.plan_entries} />}
              id="order-plan-errors"
              autoWidth
            >
              <WarningCircleIcon
                size={18}
                weight="bold"
                className="ms-2 text-warning mb-1"
                data-testid="warning"
              />
            </Tip>
          )}
          {!shouldConcealPrices && (
            <div className="ms-auto text-muted">
              <PriceTooltip size={20} />
            </div>
          )}
        </Nav>

        {/* CONTENT */}
        <Tab.Content>
          {props.extraTabs &&
            props.extraTabs.map((tab) => (
              <Tab.Pane key={tab.eventKey} eventKey={tab.eventKey}>
                <tab.component />
              </Tab.Pane>
            ))}
          {oneTime.hasOneTimeCost && (
            <Tab.Pane eventKey="onetime">
              <section className="plan-details-section">
                <FormTable>
                  {/* One */}
                  {oneTime.initialRows.length > 0 && (
                    <FixedRows
                      components={oneTime.initialRows}
                      hidePrices={shouldConcealPrices}
                      activePriceIndex={0}
                    />
                  )}

                  {/* Few */}
                  {oneTime.switchRows.length > 0 && (
                    <FixedRows
                      components={oneTime.switchRows}
                      hidePrices={shouldConcealPrices}
                      activePriceIndex={0}
                    />
                  )}

                  {/* Limit */}
                  {oneTime.totalLimitedRows.length > 0 && (
                    <ControlRows
                      components={oneTime.totalLimitedRows}
                      hidePrices={Boolean(shouldConcealPrices)}
                      viewMode={props.viewMode}
                      activePriceIndex={0}
                    />
                  )}

                  {!shouldConcealPrices && (
                    <ComponentRowTotal amount={oneTime.oneTimeTotal} />
                  )}
                </FormTable>
              </section>
            </Tab.Pane>
          )}

          {periodic.hasPeriodicCost && (
            <Tab.Pane eventKey="periodic">
              <section className="plan-details-section">
                <FormTable>
                  {/* Fixed */}
                  {periodic.fixedRows.length > 0 && (
                    <FixedRows
                      components={periodic.fixedRows}
                      hidePrices={Boolean(
                        activeFixedPriceProfile && !shouldConcealPrices,
                      )}
                      period={selectedPeriod}
                      activePriceIndex={activePriceIndex}
                    />
                  )}

                  {/* Usage */}
                  {periodic.usageRows.length > 0 && (
                    <UsageRows
                      components={periodic.usageRows}
                      hidePrices={shouldConcealPrices}
                      period={selectedPeriod}
                    />
                  )}

                  {/* Limit */}
                  {periodic.periodicLimitedRows.length > 0 && (
                    <ControlRows
                      components={periodic.periodicLimitedRows}
                      hidePrices={Boolean(shouldConcealPrices)}
                      viewMode={props.viewMode}
                      period={selectedPeriod}
                      activePriceIndex={activePriceIndex}
                    />
                  )}

                  {!activeFixedPriceProfile && !shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={periodic.periodicTotal[activePriceIndex]}
                      period={selectedPeriod}
                      setPeriod={
                        props.periods.length > 1 ? setSelectedPeriod : null
                      }
                    />
                  ) : null}
                </FormTable>
              </section>
            </Tab.Pane>
          )}
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

interface PlanDetailsTable2 {
  offering: PublicOfferingDetails;
  plan?: BasePublicPlan;
  limits?: Limits;
  viewMode?: boolean;
}

export const PlanDetailsTable2 = connect<PricesData, {}, PlanDetailsTable2>(
  pricesSelector,
)(PureDetailsTable);

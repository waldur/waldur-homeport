import { InfoIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { AlertItem } from '@/core/AlertItem';
import { defaultCurrency } from '@/core/formatCurrency';
import { StatsCard } from '@/core/StatsCard';
import { Tip } from '@/core/Tooltip';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { isFeatureVisible } from '@/features/connect';
import { DashboardFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { CreditBreakdownCard } from '../components/CreditBreakdownCard';
import { CreditBurnDownChart } from '../components/CreditBurnDownChart';
import { CreditHorizon } from '../components/CreditHorizon';
import { PacingIndicator } from '../components/PacingIndicator';
import { PolicyWatchData } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

const Metric: FC<{ value: ReactNode; caption: ReactNode; tone?: string }> = ({
  value,
  caption,
  tone,
}) => (
  <>
    <span className={tone ? `text-${tone}` : undefined}>{value}</span>
    <span className="d-block fs-6 fw-normal text-muted mt-1">{caption}</span>
  </>
);

/** An info tip in the tile's corner, for a figure whose derivation is not
 *  obvious from its label. */
const MetricTip: FC<{ id: string; label: string }> = ({ id, label }) => (
  <Tip id={id} label={label}>
    <InfoIcon weight="bold" className="text-muted" />
  </Tip>
);

/**
 * The money: what is left, what can actually be drawn, and how fast it is
 * going. What ends — and what each ending does — is the horizon table below,
 * because those are different questions and ranking them against each other is
 * what used to force a "but see above" caveat onto this card.
 */
const CreditMetrics: FC<{ data: PolicyWatchData }> = ({ data }) => {
  const { runway } = data;
  const days = runway.daysRemaining;
  // Only alarm when the organization balance is what blocks spending. An
  // allocation that is simply zero — never funded, or fully spent — reports a
  // zero spendable value too, and has always rendered as an ordinary state.
  const isBlockedByOrganization = runway.isLimitedByOrganizationCredit;
  // Severity follows the events, not just the balance: a credit that has
  // already expired leaves months of runway on paper.
  const bindingEvent = runway.events.find((event) => event.isBinding);
  const daysToBinding = bindingEvent
    ? Math.round((new Date(bindingEvent.date).getTime() - Date.now()) / DAY_MS)
    : null;
  const isWarn =
    (days !== null && days < 14) ||
    (daysToBinding !== null && daysToBinding < 30) ||
    (bindingEvent?.tone === 'danger' &&
      daysToBinding !== null &&
      daysToBinding < 60);
  const isCritical =
    (isBlockedByOrganization && runway.spendableValue <= 0) ||
    (days !== null && days < 4) ||
    (bindingEvent?.tone === 'danger' &&
      daysToBinding !== null &&
      daysToBinding < 14);

  if (!runway.credit) {
    // No allocation, no credit widget — an empty runway block would only
    // advertise a feature this project does not use.
    return null;
  }

  const lastMonthDraw = data.creditTerms?.consumptionLastMonth || 0;

  const stats = [
    {
      label: translate('Remaining'),
      icon: (
        <MetricTip
          id="credit-remaining"
          label={translate(
            'Credit still available to this project. It is drawn down as usage is compensated each month, and set to zero if the credit reaches its end date.',
          )}
        />
      ),
      value: (
        <Metric
          value={defaultCurrency(runway.credit.value)}
          caption={
            data.creditBreakdown
              ? translate('of {granted} allocated', {
                  granted: defaultCurrency(data.creditBreakdown.granted),
                })
              : translate('current balance')
          }
          tone={isCritical ? 'danger' : isWarn ? 'warning' : undefined}
        />
      ),
    },
    isBlockedByOrganization && {
      label: translate('Drawable today'),
      icon: (
        <MetricTip
          id="credit-drawable"
          label={translate(
            'Compensation stops once the organization credit is exhausted, so only this much of the allocation can actually be drawn right now.',
          )}
        />
      ),
      value: (
        <Metric
          value={defaultCurrency(runway.spendableValue)}
          caption={translate('organization balance is lower')}
          tone="danger"
        />
      ),
    },
    {
      label: translate('Average daily draw'),
      // The figure is last month's draw spread over 30 days, and it is what
      // every run-out date on this page is projected from — neither of which
      // the number says on its own.
      icon: (
        <MetricTip
          id="credit-daily-draw"
          label={translate(
            "Last month this project drew {amount} of credit. Spread over 30 days that is {rate} a day, which is the rate the projections on this page use — this month's own draw is still in progress, so it is not used.",
            {
              amount: defaultCurrency(lastMonthDraw),
              rate: defaultCurrency(runway.burnPerDay.toFixed(2)),
            },
          )}
        />
      ),
      value: (
        <Metric
          value={
            <>
              {defaultCurrency(runway.burnPerDay.toFixed(2))}
              <span className="fs-4">{translate('/d')}</span>
            </>
          }
          caption={
            lastMonthDraw > 0
              ? translate('{amount} drawn last month ÷ 30 days', {
                  amount: defaultCurrency(lastMonthDraw),
                })
              : translate('no credit drawn last month')
          }
        />
      ),
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: ReactNode;
    icon?: ReactNode;
  }>;

  return (
    <>
      <Row className="g-4 mb-5">
        {stats.map((stat, index) => (
          <Col md={stats.length > 2 ? 4 : 6} key={index}>
            <StatsCard label={stat.label} value={stat.value} icon={stat.icon} />
          </Col>
        ))}
      </Row>
      {isBlockedByOrganization && (
        <AlertItem
          variant="error"
          className="mb-3"
          title={
            runway.spendableValue <= 0
              ? translate(
                  'Organization credit is exhausted, so none of this allocation can be drawn. Contact an organization owner to top it up.',
                )
              : translate(
                  'Only {spendable} of the {allocated} allocated can be drawn — the organization credit balance is lower than this allocation.',
                  {
                    spendable: defaultCurrency(runway.spendableValue),
                    allocated: defaultCurrency(runway.credit.value),
                  },
                )
          }
        />
      )}
    </>
  );
};

interface Props {
  data: PolicyWatchData;
}

export const HealthView: FC<Props> = ({ data }) => {
  if (data.resources.length === 0) {
    return (
      <NoResult
        title={translate('No resources')}
        message={translate(
          'Policy evaluation appears once this project has resources.',
        )}
        noAction
      />
    );
  }
  return (
    <>
      {/* Each card names the subject its figures belong to. Without that frame,
          "Remaining" and "Burning" read as generic dashboard numbers rather
          than as this project's credit. */}
      <WidgetCard
        cardTitle={translate("This month's credit consumption")}
        className="mb-5"
      >
        <div className="separator mt-4 mb-5" />
        <PacingIndicator pacing={data.pacing} creditTerms={data.creditTerms} />
      </WidgetCard>

      <WidgetCard cardTitle={translate('Overall credit')} className="mb-5">
        <div className="separator mt-4 mb-5" />
        <CreditMetrics data={data} />
        {data.creditBreakdown && (
          <CreditBreakdownCard breakdown={data.creditBreakdown} />
        )}
        {isFeatureVisible(DashboardFeatures.spend_forecast) && (
          <CreditBurnDownChart data={data} />
        )}
      </WidgetCard>

      {data.runway.credit && <CreditHorizon events={data.runway.events} />}

      {/* Per-resource limits and the policy governing them live in the
          "Active limit-based resources" table above, as an expandable row —
          a second resource list here only split the same story in two.

          Having no policies is not a finding, so it gets no banner: nothing
          is wrong, there is nothing to act on, and the notice sat under every
          healthy project's credit card as permanent furniture. */}
    </>
  );
};

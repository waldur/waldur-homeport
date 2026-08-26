import {
  CaretDoubleRightIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import { CSSProperties, FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';

import { AlertItem } from '@/core/AlertItem';
import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { StatsCard } from '@/core/StatsCard';
import { translate } from '@/i18n';

import { getWatchColors } from '../chartColors';
import { CreditTerms, PacingSnapshot } from '../types';

const pct0 = (v: number) => `${Math.round(v * 100)}%`;
const clampPct = (f: number) => `${Math.min(Math.max(f, 0), 1) * 100}%`;

// The "today" tick is centred on its position, except near the ends of the bar,
// where centring would push half the text outside the card.
const markerLabel = (fraction: number): CSSProperties => ({
  position: 'absolute',
  transform:
    fraction >= 0.9
      ? 'translateX(-100%)'
      : fraction <= 0.1
        ? 'none'
        : 'translateX(-50%)',
  whiteSpace: 'nowrap',
  fontSize: 11,
  top: -18,
});

interface Props {
  pacing: PacingSnapshot;
  creditTerms?: CreditTerms | null;
  /** True when the organization balance, not this allocation, is what bounds
   *  spending. The pace verdict is withheld in that case. */
  isLimitedByOrganizationCredit?: boolean;
  /** True once the credit's end_date has passed. The verdict is withheld then
   *  too: there is no draw left to be behind on. */
  isCreditExpired?: boolean;
}

/**
 * Monthly pace against the credit's *expected consumption* (100% of the bar).
 * The minimal-consumption floor — expected × (1 − grace) — is marked on the bar
 * and stated as a badge, and a "today" tick shows the linear ideal for the day
 * of month. Keying the bar to expected (not the cost-policy budget) keeps the
 * monthly view in one frame of reference.
 */
export const PacingIndicator: FC<Props> = ({
  pacing,
  creditTerms,
  isLimitedByOrganizationCredit,
  isCreditExpired,
}) => {
  const { creditableCost, periodFraction, monthlyBudget } = pacing;
  const c = getWatchColors();

  // Prefer the credit's monthly expected consumption as the 100% reference;
  // fall back to the cost-policy budget when no expected is configured.
  const expected = creditTerms?.expectedConsumption || 0;
  const reference = expected > 0 ? expected : monthlyBudget || 0;

  if (!reference || reference <= 0) {
    return (
      <AlertItem
        variant="info"
        className="mb-3"
        title={translate(
          'Pacing not available — no expected consumption or budget set.',
        )}
      />
    );
  }

  const minimal = creditTerms?.minimalConsumption || 0;
  const minimalFraction = minimal > 0 ? minimal / reference : null;
  const gracePct = creditTerms?.graceCoefficient ?? 0;

  // Against the credit's expected consumption, so the numerator has to be
  // credit-scoped too — the whole project invoice would count cost no credit
  // covers.
  const usageFraction = creditableCost / reference;
  const isOver = usageFraction > 1;
  const overFraction = Math.max(0, usageFraction - 1);
  // Linear extrapolation of month-end consumption at the current daily rate.
  const projected = periodFraction > 0 ? creditableCost / periodFraction : 0;
  const projectedFraction = projected / reference;

  // Pace vs where a linear ramp says we should be today.
  const delta = usageFraction - periodFraction;
  const behind = delta < -0.05;
  const ahead = delta > 0.05;

  // Projection outlook against the floor / target drives the tone.
  const willMissMinimal =
    minimalFraction !== null && projectedFraction < minimalFraction;
  const willMissExpected = projectedFraction < 0.999;
  const tone: Variant = isCreditExpired
    ? // Neutral rather than alarming: an expired credit is settled, not going
      // wrong. There is nothing here for the team to act on.
      'secondary'
    : isLimitedByOrganizationCredit
      ? 'danger'
      : willMissMinimal
        ? 'danger'
        : behind || willMissExpected
          ? 'warning'
          : ahead
            ? 'info'
            : 'success';
  // "Behind pace" is a verdict on the team, and neither of these two cases is
  // theirs to answer for: an organization that has run its credit down caps
  // what this project may draw, and an expired credit is not drawn at all.
  // Name the cause instead.
  const statusLabel = isCreditExpired
    ? translate('Credit has expired')
    : isLimitedByOrganizationCredit
      ? translate('Limited by organization credit')
      : behind
        ? translate('Behind pace')
        : ahead
          ? translate('Ahead of pace')
          : translate('On pace');
  const statusHint = isCreditExpired
    ? translate(
        'Compensation stopped when the credit expired, so there is no draw left to keep pace with. Costs land on the invoice in full.',
      )
    : isLimitedByOrganizationCredit
      ? translate(
          'Compensation stops at the organization balance, so this project cannot draw to its plan however much it uses.',
        )
      : ahead
        ? translate(
            'Drawing faster than the linear ideal for this month, which may reduce job scheduling priority.',
          )
        : willMissMinimal
          ? translate(
              'At this rate the month ends below the minimum draw, and the shortfall is taken from the credit as lost.',
            )
          : undefined;

  const shareOfExpected = (fraction: number) => (
    <>
      <Badge
        variant={fraction >= 0.999 ? 'success' : 'danger'}
        size="sm"
        leftIcon={
          fraction >= 0.999 ? (
            <TrendUpIcon weight="bold" />
          ) : (
            <TrendDownIcon weight="bold" />
          )
        }
        pill
        light
      >
        {pct0(fraction)}
      </Badge>
      <span className="text-muted fs-7">{translate('of expected')}</span>
    </>
  );

  return (
    <>
      <Row className="g-4 mb-5">
        <Col md={4}>
          <StatsCard
            label={translate('Drawn so far')}
            value={defaultCurrency(creditableCost)}
            footer={shareOfExpected(usageFraction)}
          />
        </Col>
        <Col md={4}>
          <StatsCard
            label={translate('Projected month-end')}
            value={defaultCurrency(projected)}
            footer={shareOfExpected(projectedFraction)}
          />
        </Col>
        <Col md={4}>
          <StatsCard
            label={translate('Last month drew')}
            value={defaultCurrency(creditTerms?.consumptionLastMonth || 0)}
            footer={
              reference > 0 && creditTerms
                ? shareOfExpected(
                    (creditTerms.consumptionLastMonth || 0) / reference,
                  )
                : undefined
            }
          />
        </Col>
      </Row>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold">{translate('Pacing')}</span>
          <Badge variant={tone} pill outline hasBullet tooltip={statusHint}>
            {statusLabel}
          </Badge>
        </div>
        <span className="text-muted">
          {translate('{pct} of {amount} expected', {
            pct: pct0(usageFraction),
            amount: defaultCurrency(reference),
          })}
        </span>
      </div>

      {/* Pace bar: 0 → expected (100%). Fill = drawn so far. The ticks are
          positional — the floor and where a linear ramp says today should be —
          so they stay on the bar; their values are stated as badges below,
          which is what removed the label collision at the right edge. */}
      <div style={{ paddingTop: 20 }}>
        <div
          className="rounded position-relative"
          style={{ height: 16, backgroundColor: c.track }}
        >
          <div
            className="rounded"
            style={{
              height: '100%',
              width: clampPct(usageFraction),
              backgroundColor: c.brand300,
            }}
          />
          {minimalFraction !== null && (
            <div
              style={{
                position: 'absolute',
                top: -3,
                bottom: -3,
                left: clampPct(minimalFraction),
                borderLeft: `2px dashed ${c.warning}`,
              }}
              title={translate('Minimum monthly draw')}
            />
          )}
          <div
            style={{
              position: 'absolute',
              top: -3,
              bottom: -3,
              left: clampPct(periodFraction),
              borderLeft: `2px solid ${c.muted}`,
            }}
            title={translate('Ideal for today')}
          >
            <span style={markerLabel(periodFraction)} className="text-muted">
              {translate('today')}
            </span>
          </div>
          {isOver && (
            <div
              style={{
                position: 'absolute',
                top: -3,
                bottom: -3,
                right: -3,
                display: 'flex',
                alignItems: 'center',
                color: c.danger,
              }}
              title={translate('Over expected consumption')}
            >
              <CaretDoubleRightIcon weight="bold" />
            </div>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-4">
        {isOver && (
          <Badge variant="danger" size="sm" pill outline hasBullet>
            {translate('Over expected +{pct}', { pct: pct0(overFraction) })}
          </Badge>
        )}
        {minimalFraction !== null && (
          <Badge
            variant="warning"
            size="sm"
            pill
            outline
            hasBullet
            tooltip={translate(
              'Minimum monthly draw: {pct} of expected, grace {grace}%. Usage covered by credit shows as "Credit compensation" invoice items; when usage stays below the minimum, the top-up to reach it is drawn straight from the balance with no invoice item — that shortfall becomes "Lost" credit.',
              { pct: pct0(minimalFraction), grace: gracePct },
            )}
          >
            {translate('Minimum draw {amount} · {pct}', {
              amount: defaultCurrency(minimal),
              pct: pct0(minimalFraction),
            })}
          </Badge>
        )}
        <Badge
          variant="secondary"
          size="sm"
          pill
          outline
          hasBullet
          tooltip={translate(
            'Where a linear ramp says consumption should stand on this day of the month.',
          )}
        >
          {translate('Ideal for today {pct}', { pct: pct0(periodFraction) })}
        </Badge>
      </div>
    </>
  );
};

import { CaretDoubleRightIcon, InfoIcon } from '@phosphor-icons/react';
import { CSSProperties, FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { getWatchColors } from '../chartColors';
import { CreditTerms, PacingSnapshot } from '../types';

const pct0 = (v: number) => `${Math.round(v * 100)}%`;
const clampPct = (f: number) => `${Math.min(Math.max(f, 0), 1) * 100}%`;

const MARKER_LABEL: CSSProperties = {
  position: 'absolute',
  transform: 'translateX(-50%)',
  whiteSpace: 'nowrap',
  fontSize: 10,
  top: -16,
};

interface Props {
  pacing: PacingSnapshot;
  creditTerms?: CreditTerms | null;
}

/**
 * Monthly pace against the credit's *expected consumption* (100% of the bar).
 * The minimal-consumption floor — expected × (1 − grace) — is highlighted on the
 * bar, and a "today" tick shows the linear ideal for the day of month. Keying the
 * bar to expected (not the cost-policy budget) keeps the monthly view in one
 * frame of reference.
 */
export const PacingIndicator: FC<Props> = ({ pacing, creditTerms }) => {
  const { incurredCost, periodFraction, monthlyBudget } = pacing;
  const c = getWatchColors();

  // Prefer the credit's monthly expected consumption as the 100% reference;
  // fall back to the cost-policy budget when no expected is configured.
  const expected = creditTerms?.expectedConsumption || 0;
  const reference = expected > 0 ? expected : monthlyBudget || 0;

  if (!reference || reference <= 0) {
    return (
      <div className="alert alert-info py-2 mb-3">
        {translate(
          'Pacing not available — no expected consumption or budget set.',
        )}
      </div>
    );
  }

  const minimal = creditTerms?.minimalConsumption || 0;
  const minimalFraction = minimal > 0 ? minimal / reference : null;
  const gracePct = creditTerms?.graceCoefficient ?? 0;

  const usageFraction = incurredCost / reference;
  const isOver = usageFraction > 1;
  const overFraction = Math.max(0, usageFraction - 1);
  // Linear extrapolation of month-end consumption at the current daily rate.
  const projected = periodFraction > 0 ? incurredCost / periodFraction : 0;
  const projectedFraction = projected / reference;

  // Pace vs where a linear ramp says we should be today.
  const delta = usageFraction - periodFraction;
  const behind = delta < -0.05;
  const ahead = delta > 0.05;

  // Projection outlook against the floor / target drives the tone.
  const willMissMinimal =
    minimalFraction !== null && projectedFraction < minimalFraction;
  const willMissExpected = projectedFraction < 0.999;
  const tone = willMissMinimal
    ? 'danger'
    : behind || willMissExpected
      ? 'warning'
      : ahead
        ? 'info'
        : 'success';
  const statusLabel = behind
    ? translate('Behind pace')
    : ahead
      ? translate('Ahead of pace (may reduce job scheduling priority)')
      : translate('On pace');

  return (
    <div className={`border-start border-4 border-${tone} ps-3 mt-3`}>
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-1">
        <div>
          <span className="text-muted small me-2">{translate('Pacing')}</span>
          <span className={`fw-semibold text-${tone}`}>{statusLabel}</span>
        </div>
        <div className="text-muted small">
          {translate('Projected month-end: {x} ({pct} of expected)', {
            x: defaultCurrency(projected),
            pct: pct0(projectedFraction),
          })}
        </div>
      </div>

      {/* Pace bar: 0 → expected (100%). Fill = current usage. Ticks: minimal floor + today. */}
      <div style={{ paddingTop: 18, paddingBottom: 4 }}>
        <div
          className="rounded-pill position-relative"
          style={{ height: 12, backgroundColor: c.track }}
        >
          <div
            className="rounded-pill"
            style={{
              height: '100%',
              width: clampPct(usageFraction),
              backgroundColor: c.brand500,
            }}
          />
          {/* Minimal-consumption floor (expected × (1 − grace)) */}
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
            >
              <span style={MARKER_LABEL} className="text-warning fw-semibold">
                {translate('min {pct}', { pct: pct0(minimalFraction) })}
              </span>
            </div>
          )}
          {/* Where a linear pace says we should be today */}
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
            <span style={MARKER_LABEL} className="text-muted">
              {translate('today')}
            </span>
          </div>
          {/* Over-expected cap: the fill is clamped at 100%, so flag the overage. */}
          {isOver && (
            <>
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
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -16,
                  fontSize: 10,
                }}
                className="text-danger fw-semibold"
              >
                {translate('over +{pct}', { pct: pct0(overFraction) })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between flex-wrap gap-2 mt-1">
        <small className="text-muted">
          {translate('Current: {x} ({pct})', {
            x: defaultCurrency(incurredCost),
            pct: pct0(usageFraction),
          })}
        </small>
        {minimal > 0 && (
          <small className="text-warning d-inline-flex align-items-center gap-1">
            {translate('Minimal: {x}', { x: defaultCurrency(minimal) })}
            <Tip
              id="pacing-minimal-note"
              label={translate(
                'Usage covered by credit shows as "Credit compensation" invoice items. When usage stays below the minimum, the top-up to reach it is drawn straight from the credit balance with no invoice item — that shortfall becomes "Lost" credit.',
              )}
            >
              <InfoIcon weight="bold" />
            </Tip>
          </small>
        )}
        <small className="text-muted">
          {translate('Expected: {x} (100%)', {
            x: defaultCurrency(reference),
          })}
        </small>
      </div>

      <div className="text-muted mt-2" style={{ fontSize: 11 }}>
        {minimalFraction !== null
          ? translate(
              '"today" = ideal consumption for today · "min" = minimum draw ({pct} of expected, grace {grace}%)',
              { pct: pct0(minimalFraction), grace: gracePct },
            )
          : translate('"today" = ideal consumption for today')}
      </div>
    </div>
  );
};

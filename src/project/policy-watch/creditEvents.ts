import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CreditEvent } from './types';

interface ResourceEndDates {
  /** The date the resource is actually scheduled to terminate: the earliest of
   *  its own end date and the project-driven one, grace period included. */
  resource_effective_end_date?: string | null;
  end_date?: string | null;
}

interface ProjectEndDates {
  end_date?: string | null;
  /** Project end date plus the grace period. Resources are terminated here. */
  effective_end_date?: string | null;
  is_in_grace_period?: boolean;
}

export interface CreditEventInput {
  /** Balance of the project credit allocation. */
  balance: number;
  /** What can actually be drawn: the allocation capped by the organization
   *  balance. Equal to `balance` unless the organization is the constraint. */
  spendableValue: number;
  isLimitedByOrganizationCredit: boolean;
  /** Date the spendable balance reaches zero at the current burn. */
  exhaustionDate: string | null;
  burnPerDay: number;
  /** Credit end date. Always the first of a month. */
  creditEndDate: string | null;
  project: ProjectEndDates | null;
  resources: ResourceEndDates[];
  /** Policies that have not fired yet, with their estimated time to firing. */
  policies?: {
    actionLabel: string;
    etaDays: number | null;
    kind?: 'project-cost' | 'customer-cost' | 'slurm-periodic';
    scopeName?: string;
  }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Everything that ends, each carrying what it does.
 *
 * The four conditions have genuinely different consequences, which is why they
 * are not collapsed into one countdown:
 *
 * - **Organization credit exhausted** — compensation has already stopped. Not a
 *   future date at all.
 * - **Balance empty** — compensation stops; resources keep running and their
 *   cost lands on the invoice.
 * - **Credit expiry** — the remaining balance is zeroed at the next monthly
 *   finalization and forfeited. Resources are untouched. The final month also
 *   waives the grace coefficient, so the minimum draw jumps to the full
 *   expected consumption (`BaseCredit.minimal_consumption`).
 * - **Project end date** — resources are paused at the raw end date and
 *   terminated once the grace period is over.
 * - **Last resource ends** — the work stops; the money is unaffected.
 */
export const buildCreditEvents = (
  input: CreditEventInput,
  today: Date = new Date(),
): CreditEvent[] => {
  const todayIso = isoDate(today);
  const events: CreditEvent[] = [];

  if (input.isLimitedByOrganizationCredit && input.spendableValue <= 0) {
    // Already in effect, so it is dated today rather than projected: nothing
    // can be drawn until an owner tops the organization credit up.
    events.push({
      kind: 'blocked',
      date: todayIso,
      title: translate('Spending is already blocked'),
      consequence: translate(
        'The organization credit is exhausted, so none of the {balance} allocated can be drawn. Costs are landing on the invoice uncompensated.',
        { balance: defaultCurrency(input.balance) },
      ),
      tone: 'danger',
      isBinding: false,
    });
  } else if (input.exhaustionDate) {
    events.push({
      kind: 'exhaustion',
      date: input.exhaustionDate,
      title: translate('Credit balance is empty'),
      consequence: translate(
        'At {burn}/day. Compensation stops and costs start landing on the invoice; resources keep running.',
        { burn: defaultCurrency(input.burnPerDay.toFixed(2)) },
      ),
      tone: 'warning',
      isBinding: false,
    });
  }

  if (input.creditEndDate) {
    events.push({
      kind: 'credit-expiry',
      date: input.creditEndDate,
      title: translate('Credit expires'),
      consequence: translate(
        'Whatever is left of the credit is set to zero and forfeited. Resources keep running, uncompensated. The final month also waives the grace coefficient, so the minimum draw is the full expected consumption.',
      ),
      tone: 'danger',
      isBinding: false,
    });
  }

  const projectEnd = input.project?.end_date || null;
  const projectEffectiveEnd = input.project?.effective_end_date || null;
  if (projectEnd) {
    // Only a real grace window earns its own row; without one the pause and the
    // termination are the same event and one row states it better than two.
    const hasGraceWindow =
      projectEffectiveEnd && projectEffectiveEnd !== projectEnd;
    if (hasGraceWindow) {
      events.push({
        kind: 'project-pause',
        date: projectEnd,
        title: translate('Project reaches its end date'),
        consequence: translate(
          'Resources are paused for the grace period. Offerings that opt out of the grace period are terminated straight away.',
        ),
        tone: 'warning',
        isBinding: false,
      });
    }
    events.push({
      kind: 'project-end',
      date: projectEffectiveEnd || projectEnd,
      title: hasGraceWindow
        ? translate('Grace period ends')
        : translate('Project ends'),
      consequence: translate(
        'Every remaining resource is terminated. A project left with no active resources is deleted.',
      ),
      tone: 'danger',
      isBinding: false,
    });
  }

  // The work stops when the last resource does — but only when every resource
  // has an end date. One open-ended resource and the project keeps consuming.
  const resourceEnds = input.resources.map(
    (r) => r.resource_effective_end_date || r.end_date || null,
  );
  const lastResourceEnd =
    resourceEnds.length > 0 && resourceEnds.every(Boolean)
      ? (resourceEnds as string[]).slice().sort().slice(-1)[0]
      : null;
  // A project end date already terminates everything, so this row would only
  // restate it.
  if (lastResourceEnd && !projectEnd) {
    events.push({
      kind: 'resources-end',
      date: lastResourceEnd,
      title: translate('Last resource ends'),
      consequence: translate(
        'Nothing is left running, so the credit stops being drawn. Any balance left at that point is still subject to the minimum monthly draw.',
      ),
      tone: 'muted',
      isBinding: false,
    });
  }

  // A policy fires on an estimate, not a schedule, but it still has to sort
  // against the dated events — "~45 days" placed next to absolute dates cannot
  // be ordered by the reader, and puts a sooner event below a later one.
  for (const policy of input.policies || []) {
    if (policy.etaDays === null || policy.etaDays <= 0) {
      continue;
    }
    events.push({
      kind: 'policy',
      date: isoDate(new Date(today.getTime() + policy.etaDays * DAY_MS)),
      title: policy.actionLabel,
      // An organization-wide cap is measured against every project under it,
      // so the reader has to know the action is not driven by this project
      // alone — and that other projects can bring the date forward.
      consequence:
        policy.kind === 'customer-cost'
          ? translate(
              "Organization-wide cap on {scope}, measured across every project under it. Estimated from this project's draw, so spending elsewhere brings it closer.",
              { scope: policy.scopeName || translate('the organization') },
            )
          : translate('Fires if the current usage trend holds.'),
      tone: 'warning',
      isBinding: false,
      approximate: true,
    });
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  // The binding event is the soonest one that stops something. An empty balance
  // does not: it changes who pays, not whether the work runs. Neither does a
  // policy on its own — it is an estimate, and its action is stated in the row.
  const binding = events.find(
    (event) => event.kind !== 'exhaustion' && event.kind !== 'policy',
  );
  if (binding) {
    binding.isBinding = true;
  } else if (events.length) {
    events[0].isBinding = true;
  }

  return events;
};

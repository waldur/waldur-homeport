import {
  formatDate,
  formatISODate,
  formatMonth,
  parseDate,
} from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { finalCoveredMonth, writeOffDate } from './creditRunway';
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
  /** Policies and when they fire. `etaDays === 0` is a threshold already
   *  reached, which the server reports only when the policy is genuinely
   *  triggered — not merely when the cost is over the cap. */
  policies?: {
    actionLabel: string;
    etaDays: number | null;
    kind?: 'project-cost' | 'customer-cost' | 'slurm-periodic';
    scopeName?: string;
    /** Raw action list, to tell an action that stops resources from one that
     *  only notifies — the credit rows claim resources keep running. */
    action?: string;
    hasFired?: boolean;
  }[];
}

const isoDate = formatISODate;

/** Actions that stop resources, as opposed to shrinking or merely reporting on
 *  them. The credit rows tell the reader resources keep running, which is true
 *  of credit exhaustion on its own and false once one of these is in effect. */
const STOPPING_ACTIONS = [
  'request_pausing',
  'terminate_resources',
  // A different action name, not a variant of the one above: substring
  // matching missed it, because 'request_slurm_resource_pausing' does not
  // contain 'request_pausing'.
  'request_slurm_resource_pausing',
];

const stopsResources = (policy: { action?: string; etaDays: number | null }) =>
  policy.etaDays === 0 &&
  // Split rather than substring-match: `actions` is a comma-separated list, and
  // matching loosely would let a longer action name containing one of these
  // count as the action itself.
  (policy.action || '')
    .split(',')
    .some((a) => STOPPING_ACTIONS.includes(a.trim()));

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
 * - **Credit expiry** — compensation stops on `end_date`; the month before it
 *   is the last one covered, and waives the grace coefficient, so the minimum
 *   draw jumps to the full expected consumption
 *   (`BaseCredit.minimal_consumption`). The balance left over is written off a
 *   month later. Resources are untouched throughout.
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
  // Whether anything is actually stopping the work right now. The credit rows
  // below each say "resources keep running", which is true of what that row
  // describes and false of the project as a whole once a pausing policy has
  // fired — and the two rows are the most prominent on the card, so between
  // them they told a project being paused that nothing was stopping.
  const resourcesStopping = (input.policies || []).some(stopsResources);
  const stoppingEvents = new Set<CreditEvent>();
  // Each row states this in full rather than appending a shared clause:
  // concatenating translated fragments fixes English word order onto every
  // other language, which `waldur-custom/no-template-in-translate` forbids.

  if (input.isLimitedByOrganizationCredit) {
    // Already in effect, so it is dated today rather than projected. A partly
    // capped allocation counts: the project cannot draw what the card shows it
    // holds, which is exactly the surprise worth stating, and it used to
    // produce no row at all.
    const exhausted = input.spendableValue <= 0;
    events.push({
      kind: 'blocked',
      date: todayIso,
      title: exhausted
        ? translate('Spending is already blocked')
        : translate('Only part of the allocation can be drawn'),
      consequence: exhausted
        ? translate(
            'The organization credit is exhausted, so none of the {balance} allocated can be drawn. Costs are landing on the invoice uncompensated.',
            { balance: defaultCurrency(input.balance) },
          )
        : translate(
            'The organization credit behind this allocation is down to {spendable}, so only that much of the {balance} can be drawn. The rest is unavailable until an organization owner tops it up.',
            {
              spendable: defaultCurrency(input.spendableValue),
              balance: defaultCurrency(input.balance),
            },
          ),
      tone: 'danger',
      isBinding: false,
    });
  }

  // A capped project with nothing drawable has no rate to project from, so an
  // exhaustion date would be noise on top of the blocked row above. A project
  // that has drawn its own allocation to zero has no such row, so it keeps the
  // projection — dated today — rather than being left with nothing to show.
  const cappedWithNothingDrawable =
    input.isLimitedByOrganizationCredit && input.spendableValue <= 0;
  if (input.exhaustionDate && !cappedWithNothingDrawable) {
    // The projection runs against what can actually be drawn. When the
    // organization is the constraint that is the organization's balance, not
    // this allocation — titling it "credit balance is empty" contradicted the
    // untouched balance shown right above it.
    const capped = input.isLimitedByOrganizationCredit;
    events.push({
      kind: 'exhaustion',
      date: input.exhaustionDate,
      title: capped
        ? translate('Organization credit runs out')
        : translate('Credit balance is empty'),
      consequence: capped
        ? translate(
            'The {spendable} still drawable lasts this long at {burn}/day. The rest of this allocation stays unavailable, and costs start landing on the invoice uncompensated.',
            {
              spendable: defaultCurrency(input.spendableValue),
              burn: defaultCurrency(input.burnPerDay.toFixed(2)),
            },
          )
        : resourcesStopping
          ? translate(
              'At {burn}/day. Compensation stops and costs start landing on the invoice. Resources are not left running: a cost policy has reached its threshold, and its action applies to them.',
              { burn: defaultCurrency(input.burnPerDay.toFixed(2)) },
            )
          : translate(
              'At {burn}/day. Compensation stops and costs start landing on the invoice; resources keep running.',
              { burn: defaultCurrency(input.burnPerDay.toFixed(2)) },
            ),
      tone: 'warning',
      isBinding: false,
    });
  }

  if (input.creditEndDate) {
    // Two dates, and conflating them is what made this row wrong in both
    // directions. `end_date` is when the credit stops compensating; the
    // write-off is a month later. Month-end finalization runs
    // set_to_zero_overdue_credits with effective_date pinned to the 1st,
    // filtering `end_date__lt=effective_date` — so a credit dated 1 Aug
    // survives the 1 Aug run and compensates July one last time (with the
    // grace coefficient waived, since end_date's month is the running month),
    // then is zeroed by the 1 Sep run *before* September's compensation is
    // applied. Nothing spent in August is ever compensated.
    //
    // So the row is dated on end_date — that is the event that binds — and the
    // balance still on screen afterwards is named as the residue it is, rather
    // than offered as something left to spend.
    const expired = input.creditEndDate <= todayIso;
    const finalMonth = formatMonth(finalCoveredMonth(input.creditEndDate));
    const writtenOff = formatDate(writeOffDate(input.creditEndDate));
    events.push({
      kind: 'credit-expiry',
      date: input.creditEndDate,
      title: expired
        ? translate('Credit has expired')
        : translate('Credit expires'),
      consequence: expired
        ? resourcesStopping
          ? translate(
              '{month} was the last month this credit compensated. Nothing spent since has been drawn against it, and the {balance} still shown is written off at the month-end run on {writtenOff}. Resources are not left running: a cost policy has reached its threshold, and its action applies to them.',
              {
                month: finalMonth,
                balance: defaultCurrency(input.balance),
                writtenOff,
              },
            )
          : translate(
              '{month} was the last month this credit compensated. Nothing spent since has been drawn against it, and the {balance} still shown is written off at the month-end run on {writtenOff}. Resources keep running, uncompensated.',
              {
                month: finalMonth,
                balance: defaultCurrency(input.balance),
                writtenOff,
              },
            )
        : resourcesStopping
          ? translate(
              '{month} is the last month this credit compensates, and it waives the grace coefficient — the minimum draw is the full expected consumption. Nothing spent after that is compensated, and whatever is left is written off at the month-end run on {writtenOff}. Resources are not left running: a cost policy has reached its threshold, and its action applies to them.',
              { month: finalMonth, writtenOff },
            )
          : translate(
              '{month} is the last month this credit compensates, and it waives the grace coefficient — the minimum draw is the full expected consumption. Nothing spent after that is compensated, and whatever is left is written off at the month-end run on {writtenOff}. Resources keep running.',
              { month: finalMonth, writtenOff },
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
    if (policy.etaDays === null || policy.etaDays < 0) {
      continue;
    }
    // 0 is not a projection that rounded down — the server reports it only when
    // the threshold is crossed *and* the policy is genuinely triggered, which
    // for a cost policy also requires the credit balance to have fallen to the
    // limit. Bundling it with "no estimate" and skipping both is what left a
    // project being paused with nothing on this card at all.
    const reached = policy.etaDays === 0;
    const event: CreditEvent = {
      kind: 'policy',
      date: reached
        ? todayIso
        : isoDate(parseDate(today).plus({ days: policy.etaDays })),
      title: policy.actionLabel,
      // An organization-wide cap is measured against every project under it,
      // so the reader has to know the action is not driven by this project
      // alone — and that other projects can bring the date forward.
      consequence: reached
        ? policy.hasFired
          ? translate(
              'The threshold is reached and this action has been applied.',
            )
          : translate(
              'The threshold is reached. This action is applied at the next policy evaluation.',
            )
        : policy.kind === 'customer-cost'
          ? translate(
              'Organization-wide cap on {scope}, measured across every project under it. Other projects spending against the same cap bring it closer.',
              { scope: policy.scopeName || translate('the organization') },
            )
          : translate('Fires if the current usage trend holds.'),
      // Danger is reserved for a threshold that actually stops something:
      // `HealthView` turns a danger-toned binding event into a critical card,
      // and a notify-only policy reaching its threshold must not do that while
      // the rows beside it correctly say resources keep running.
      tone: reached && stopsResources(policy) ? 'danger' : 'warning',
      isBinding: false,
      approximate: !reached,
    };
    events.push(event);
    if (stopsResources(policy)) {
      stoppingEvents.add(event);
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  // The binding event is the soonest one that stops something. An empty balance
  // does not: it changes who pays, not whether the work runs. Neither does a
  // policy on its own — it is an estimate, and its action is stated in the row.
  // A policy binds only when it stops something. An estimate does not — it is a
  // projection, and its action is stated in the row — and neither does a
  // notify-only policy at its threshold, which would otherwise turn the whole
  // card critical while the rows beside it correctly say nothing is stopping.
  // Matched by identity rather than by date: several policies can be dated
  // today, and only some of them stop anything.
  const binding = events.find(
    (event) =>
      event.kind !== 'exhaustion' &&
      (event.kind !== 'policy' || stoppingEvents.has(event)),
  );
  if (binding) {
    binding.isBinding = true;
  } else if (events.length) {
    events[0].isBinding = true;
  }

  return events;
};

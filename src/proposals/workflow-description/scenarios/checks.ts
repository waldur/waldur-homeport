import { ScenarioResult, ScenarioTotals } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ProposalState } from '@/proposals/types';
import { formatProposalState } from '@/proposals/utils';
import { outcomeLabel } from '@/proposals/workflow/constants';

import { recipientLabel, triggerLabel } from '../mail/labels';
import { actorLabel } from '../summary';

type Entry = Record<string, any>;

const quoted = (value: unknown) =>
  typeof value === 'string' ? `“${value}”` : JSON.stringify(value);

const STEP_STATUSES: Record<string, () => string> = {
  pending: () => translate('pending'),
  active: () => translate('active'),
  completed: () => translate('completed'),
  skipped: () => translate('skipped'),
  expired: () => translate('lapsed'),
  withdrawn: () => translate('withdrawn'),
};

/** How an assertion names what it is about: steps by their names, the
 * rest by their labels; anything unknown as written. */
const namer = (names?: Map<string, string>) => ({
  step: (key: string) => names?.get(key) ?? key,
  actor: (kind: string) => actorLabel(kind),
  state: (state: string) => formatProposalState(state as ProposalState),
  status: (status: string) => STEP_STATUSES[status]?.() ?? status,
  outcome: (outcome: string) => outcomeLabel(outcome),
});

const mailFilter = (entry: Entry, name: ReturnType<typeof namer>) =>
  [
    entry.actor
      ? name.actor(entry.actor)
      : entry.recipient
        ? recipientLabel(entry.recipient)
        : null,
    entry.trigger ? triggerLabel(entry.trigger) : null,
    entry.step ? translate('at {step}', { step: name.step(entry.step) }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * A scenario's assertion, in words, naming steps by ``names`` (key to
 * name) when given. Each names exactly one kind; an unknown one is shown
 * as written.
 */
export const assertionText = (
  entry: Entry,
  names?: Map<string, string>,
): string => {
  const text = describeAssertion(entry, namer(names));
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const describeAssertion = (
  entry: Entry,
  name: ReturnType<typeof namer>,
): string => {
  if ('label' in entry) {
    const label = entry.label;
    const reader = label.role
      ? name.actor(label.role)
      : name.actor(label.audience);
    const where = label.outcome
      ? name.outcome(label.outcome)
      : label.state
        ? name.state(label.state)
        : name.step(label.step);
    return translate('{reader} label for {where} reads {text}', {
      reader,
      where,
      text: quoted(label.text),
    });
  }
  if ('notified' in entry) {
    const filter = mailFilter(entry.notified, name);
    return entry.notified.count != null
      ? translate('Mail: {filter} ({count} mails)', {
          filter,
          count: entry.notified.count,
        })
      : translate('Mail: {filter}', { filter });
  }
  if ('not_notified' in entry) {
    return translate('No mail: {filter}', {
      filter: mailFilter(entry.not_notified, name),
    });
  }
  if ('proposal_state' in entry) {
    return translate('The proposal ends {state}', {
      state: name.state(entry.proposal_state),
    });
  }
  if ('step_status' in entry) {
    const status = entry.step_status;
    return translate('{step} is {status}', {
      step: name.step(status.step),
      status: [
        status.status ? name.status(status.status) : null,
        status.outcome ? name.outcome(status.outcome) : null,
      ]
        .filter(Boolean)
        .join(' · '),
    });
  }
  if ('visible' in entry) {
    return translate('{role} sees {step}', {
      role: name.actor(entry.visible.role),
      step: name.step(entry.visible.step),
    });
  }
  if ('hidden' in entry) {
    return translate('{role} does not see {step}', {
      role: name.actor(entry.hidden.role),
      step: name.step(entry.hidden.step),
    });
  }
  if ('ends_at' in entry) {
    return translate('The workflow ends at {step}', {
      step: name.step(entry.ends_at),
    });
  }
  return JSON.stringify(entry);
};

/** How many scenarios there are: "5 scenarios". */
export const scenarioCount = (count: number) =>
  count === 1
    ? translate('1 scenario')
    : translate('{count} scenarios', { count });

/** How the last run went, worst first: "1 failed", "2 could not run" or
 * "5 passed". */
export const scenarioOutcome = (
  totals: ScenarioTotals,
): { variant: 'success' | 'danger' | 'warning'; label: string } => {
  if (totals.failed) {
    return {
      variant: 'danger',
      label: translate('{count} failed', { count: totals.failed }),
    };
  }
  if (totals.error) {
    return {
      variant: 'warning',
      label: translate('{count} could not run', { count: totals.error }),
    };
  }
  return {
    variant: 'success',
    label: translate('{count} passed', { count: totals.passed }),
  };
};

/** A saved scenario as written, with how it went when last run. */
export interface ScenarioRow {
  key: string;
  name: string;
  description: string;
  assertions: Entry[];
  result?: ScenarioResult;
}

/**
 * The saved scenarios, each with its last result: listed before they have
 * ever run. A result whose scenario has since been removed is left out;
 * without the scenarios written out, the results are listed as they are.
 */
export const scenarioRows = (
  scenarios: Entry[] | undefined,
  results: ScenarioResult[] | undefined,
): ScenarioRow[] => {
  const byKey = new Map((results ?? []).map((result) => [result.key, result]));
  if (!scenarios?.length) {
    return (results ?? []).map((result) => ({
      key: result.key ?? '',
      name: result.name,
      description: '',
      assertions: [],
      result,
    }));
  }
  return scenarios.map((scenario) => ({
    key: scenario.key ?? '',
    name: scenario.name || scenario.key || '',
    description: scenario.description ?? '',
    assertions: Array.isArray(scenario.assertions) ? scenario.assertions : [],
    result: byKey.get(scenario.key),
  }));
};

export const stepNames = (keys: string[], names: Map<string, string>) =>
  keys.map((key) => names.get(key) ?? key).join(', ');

/** A scenario key from its name: lower case, words joined by underscores. */
export const scenarioKey = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);

/** The dry run's draft named as a scenario. */
export const namedScenario = (
  draft: Record<string, any>,
  values: { name?: string; key?: string; description?: string },
) => ({
  ...draft,
  key: values.key || scenarioKey(values.name || ''),
  name: values.name || '',
  description: values.description || '',
});

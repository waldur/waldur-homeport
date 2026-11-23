import {
  OrderFlowRule,
  OrderFlowSource,
  OrderFlowStep,
  OrderFlowStepStatusEnum,
  OrderFlowTerminal,
} from 'waldur-js-client';

import { translate } from '@/i18n';

export const stepStatusLabel = (status: OrderFlowStepStatusEnum) =>
  ({
    runs: translate('Always'),
    skipped: translate('Skipped'),
    conditional: translate('Only sometimes'),
  })[status];

// Names short enough for a step box; the dialog shows the full label.
const STEP_SHORT: Partial<Record<OrderFlowStep['key'], () => string>> = {
  placed: () => translate('Order placed'),
  consumer_review: () => translate('Consumer review'),
  project_start: () => translate('Project start'),
  provider_review: () => translate('Provider review'),
  start_date: () => translate('Order start date'),
  execution: () => translate('Execution'),
  done: () => translate('Done'),
};

export const stepShortLabel = (step: OrderFlowStep) =>
  STEP_SHORT[step.key]?.() ?? step.label;

export const terminalLabel = (terminal: OrderFlowTerminal) =>
  ({
    rejected: translate('Rejected'),
    canceled: translate('Canceled'),
    erred: terminal.retry ? translate('Erred, can retry') : translate('Erred'),
  })[terminal.key];

// A few words per rule, for the step box; the dialog shows the full text.
const RULE_SHORT: Record<string, () => string> = {
  purchase_order_hold: () => translate('Until a PO is attached'),
  placed_with_review: () => translate('Pre-approved allocation'),
  staff: () => translate('Staff orders skip it'),
  autoapprove_disabled: () => translate('Auto-approval disabled'),
  private_offering: () => translate('Private offering'),
  service_provider_project: () => translate('Provider’s own projects'),
  provider_owner_terminates: () => translate('Provider owner terminates'),
  auto_approve_role: () => translate('Auto-approved roles'),
  approver_orders: () => translate('Approvers approve own'),
  project_auto_approval: () => translate('Project auto-approval'),
  site_agent: () => translate('Site agent offering'),
  basic: () => translate('Basic offering'),
  remote_auto_approve: () => translate('Remote auto-approval'),
  remote_provider_owner: () => translate('Approved by provider owner'),
  remote_service_manager: () => translate('Approved by service manager'),
  remote: () => translate('Remote offering'),
  script: () => translate('Script auto-approval'),
  automatic: () => translate('Not reviewed for this type'),
};

export const ruleShortLabel = (rule: OrderFlowRule) =>
  RULE_SHORT[rule.key]?.() ?? rule.key;

/** The rules that hold or may hold, in the order they are asked. */
export const decidingRules = (step: OrderFlowStep) =>
  step.rules.filter((rule) => rule.reached && rule.holds !== false);

/** One line saying what decides the step, for its box. */
export const stepVerdictLine = (step: OrderFlowStep): string | undefined => {
  const deciding = decidingRules(step);
  if (deciding.length === 1) return ruleShortLabel(deciding[0]);
  if (deciding.length > 1) {
    return translate('{count} rules decide', { count: deciding.length });
  }
  if (step.key === 'execution' && step.mode) {
    return step.mode === 'sync'
      ? translate('Done when processing returns')
      : translate('Waits for a report back');
  }
  return undefined;
};

export const ruleOutcomeLabel = (rule: OrderFlowRule) => {
  if (!rule.reached) return translate('Not reached: an earlier rule decides');
  if (rule.holds === false) return translate('Does not apply');
  const outcome = rule.skips
    ? translate('the step is skipped')
    : rule.skips === false
      ? translate('the step runs')
      : translate('depends on the order');
  return rule.holds
    ? translate('Applies: {outcome}', { outcome })
    : translate('May apply: {outcome}', { outcome });
};

const SOURCE_KINDS: Record<OrderFlowSource['kind'], () => string> = {
  plugin_option: () => translate('Offering setting'),
  offering: () => translate('Offering'),
  constance: () => translate('Platform setting'),
  project: () => translate('Project'),
  orderer: () => translate('Orderer'),
  order: () => translate('Order'),
  role: () => translate('Role permission'),
  engine: () => translate('Built in'),
};

export const sourceKindLabel = (source: OrderFlowSource) =>
  SOURCE_KINDS[source.kind]();

export const sourceValueLabel = (source: OrderFlowSource) => {
  const { value } = source;
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'boolean')
    return value ? translate('on') : translate('off');
  if (Array.isArray(value)) return value.length ? value.join(', ') : undefined;
  return String(value);
};

export const formatDuration = (seconds: number) => {
  if (seconds < 90)
    return translate('{count} s', { count: Math.round(seconds) });
  const minutes = seconds / 60;
  if (minutes < 90)
    return translate('{count} min', { count: Math.round(minutes) });
  const hours = minutes / 60;
  if (hours < 36) return translate('{count} h', { count: Math.round(hours) });
  return translate('{count} d', { count: Math.round(hours / 24) });
};

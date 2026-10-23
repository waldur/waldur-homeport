import { describe, expect, it } from 'vitest';
import { PolicyGateEnum } from 'waldur-js-client';

import {
  getCostPolicyWarning,
  getTriggerStatusView,
  TriggerStatusPolicy,
} from './triggerStatus';

const policy = (
  gate: PolicyGateEnum,
  triggered: boolean,
  credit: string | null = null,
  overrides: Partial<TriggerStatusPolicy> = {},
): TriggerStatusPolicy => ({
  trigger_status: { gate, triggered, credit_value_compared: credit },
  has_fired: false,
  current_cost: '7701.67',
  limit_cost: 100,
  ...overrides,
});

describe('getTriggerStatusView', () => {
  it('shows nothing when the backend sends no trigger_status', () => {
    expect(getTriggerStatusView({ has_fired: false, limit_cost: 100 })).toBe(
      null,
    );
  });

  it('names the project credit and the limit while the policy is held', () => {
    const view = getTriggerStatusView(
      policy('held_by_project_credit', false, '2850.00'),
    );
    expect(view.label).toBe('Waiting for project credit');
    expect(view.explanation).toContain('7,701.67');
    expect(view.explanation).toContain('2,850.00');
    expect(view.explanation).toContain('100.00');
    expect(view.held).toBe(true);
    expect(view.variant).toBe('warning');
  });

  it('names the organization credit without a figure when it is withheld', () => {
    const view = getTriggerStatusView(
      policy('held_by_customer_credit', false, null),
    );
    expect(view.label).toBe('Waiting for organization credit');
    expect(view.explanation).toContain('organization credit left is above');
    expect(view.explanation).not.toContain('null');
  });

  it('says the actions are pending when triggered but not fired', () => {
    const view = getTriggerStatusView(policy('credit_exhausted', true, '0.00'));
    expect(view.label).toBe('Actions pending');
    expect(view.explanation).toContain('is over the limit');
    expect(view.note).toContain('next evaluation');
  });

  it('does not show the waiting text for a fired policy', () => {
    const view = getTriggerStatusView(
      policy('no_credit', true, null, { has_fired: true }),
    );
    expect(view.label).toBe('Limit reached');
    expect(view.label).not.toContain('Waiting');
    expect(view.explanation).toContain('there is no credit');
  });

  it('does not show the waiting text below the limit', () => {
    const view = getTriggerStatusView(
      policy('cost_below_limit', false, null, { current_cost: '50' }),
    );
    expect(view.label).toBe('Below limit');
    expect(view.variant).toBe('success');
  });

  it('says a fired policy no longer over its limit resets', () => {
    const view = getTriggerStatusView(
      policy('held_by_project_credit', false, '2900.00', { has_fired: true }),
    );
    expect(view.label).toBe('Resets at next evaluation');
    expect(view.note).toContain('undone');
  });

  it('shows nothing for a gate this client does not know', () => {
    expect(
      getTriggerStatusView(policy('held_by_wallet' as PolicyGateEnum, false)),
    ).toBe(null);
  });

  it('explains a policy that ignores credit', () => {
    const view = getTriggerStatusView(policy('credit_ignored', true));
    expect(view.explanation).toContain('does not take credit into account');
  });
});

describe('getCostPolicyWarning', () => {
  it('warns about actions pending first', () => {
    expect(
      getCostPolicyWarning([
        policy('held_by_project_credit', false, '110'),
        policy('credit_exhausted', true, '0'),
      ]),
    ).toBe('pending');
  });

  it('warns when a held policy has little credit left above its limit', () => {
    expect(
      getCostPolicyWarning([policy('held_by_project_credit', false, '110')]),
    ).toBe('soon');
  });

  it('does not warn while plenty of credit is left', () => {
    expect(
      getCostPolicyWarning([policy('held_by_project_credit', false, '2850')]),
    ).toBe(null);
  });

  it('cannot judge a held policy whose balance is withheld', () => {
    expect(
      getCostPolicyWarning([policy('held_by_customer_credit', false, null)]),
    ).toBe(null);
  });

  it('does not call a fired policy that is about to reset close', () => {
    expect(
      getCostPolicyWarning([
        policy('held_by_project_credit', false, '110', { has_fired: true }),
      ]),
    ).toBe(null);
  });

  it('does not warn about fired policies or an older backend', () => {
    expect(
      getCostPolicyWarning([
        policy('no_credit', true, null, { has_fired: true }),
        { has_fired: false, limit_cost: 100 },
      ]),
    ).toBe(null);
    expect(getCostPolicyWarning(undefined)).toBe(null);
  });
});

import { describe, expect, it } from 'vitest';
import type { FeatureRule } from 'waldur-js-client';

import {
  hasCriterion,
  countActiveRules,
  formValuesToPayload,
  ruleToFormValues,
  summarizeRule,
} from './utils';

const rule = (overrides: Partial<FeatureRule> = {}): FeatureRule =>
  ({
    url: '',
    uuid: 'r1',
    feature_key: 'marketplace.realtime_updates',
    is_active: true,
    users_summary: [],
    customers_summary: [],
    organization_groups_summary: [],
    created_by: null,
    created_by_username: null,
    created: '',
    modified: '',
    ...overrides,
  }) as FeatureRule;

describe('feature rule form', () => {
  it('sends uuids, lists and the claims map', () => {
    const values = {
      ...ruleToFormValues(),
      users: [{ uuid: 'u1', full_name: 'Alice' }],
      roles: ['CUSTOMER.OWNER'],
      user_email_patterns: '.*@a\\.org$ .*@b\\.org$',
      user_claims: [{ claim: 'entitlement', values: 'x, y' }],
    };
    expect(formValuesToPayload('micro_apps.app', values)).toMatchObject({
      feature_key: 'micro_apps.app',
      users: ['u1'],
      roles: ['CUSTOMER.OWNER'],
      user_email_patterns: ['.*@a\\.org$', '.*@b\\.org$'],
      user_claims: { entitlement: ['x', 'y'] },
    });
  });

  it('round-trips a rule through the form', () => {
    const existing = rule({
      users_summary: [{ uuid: 'u1', username: 'alice', full_name: 'Alice' }],
      user_identity_sources: ['eduteams'],
    });
    const payload = formValuesToPayload(
      existing.feature_key,
      ruleToFormValues(existing),
    );
    expect(payload.users).toEqual(['u1']);
    expect(payload.user_identity_sources).toEqual(['eduteams']);
  });

  it('tells whether any criterion is configured', () => {
    expect(hasCriterion(ruleToFormValues())).toBe(false);
    expect(hasCriterion({ ...ruleToFormValues(), roles: ['X.Y'] })).toBe(true);
    // A half-filled claim row is no criterion.
    expect(
      hasCriterion({
        ...ruleToFormValues(),
        user_claims: [{ claim: 'entitlement', values: '' }],
      }),
    ).toBe(false);
  });
});

describe('summarizeRule', () => {
  it('names each configured criterion', () => {
    const lines = summarizeRule(
      rule({
        customers_summary: [{ uuid: 'c1', name: 'Pilot org' }],
        roles: ['OFFERING.MANAGER'],
        user_claims: { entitlement: ['x'] },
      }),
    );
    expect(lines.join('\n')).toContain('Pilot org');
    expect(lines.join('\n')).toContain('OFFERING.MANAGER');
    expect(lines.join('\n')).toContain('entitlement');
    expect(lines).toHaveLength(3);
  });

  it('says no one for a rule without criteria', () => {
    expect(summarizeRule(rule())).toEqual(['No one']);
  });
});

describe('countActiveRules', () => {
  it('counts active rules per key', () => {
    expect(
      countActiveRules([
        rule(),
        rule({ uuid: 'r2' }),
        rule({ uuid: 'r3', is_active: false }),
        rule({ uuid: 'r4', feature_key: 'micro_apps.app' }),
      ]),
    ).toEqual({
      'marketplace.realtime_updates': 2,
      'micro_apps.app': 1,
    });
  });
});

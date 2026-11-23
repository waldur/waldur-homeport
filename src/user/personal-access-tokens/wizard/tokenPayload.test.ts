import { describe, expect, it } from 'vitest';
import type { PatTemplate, PatTemplateTarget } from 'waldur-js-client';

import { buildSiteAgentTokenConfig } from '@/site-agent/siteAgentTokenConfig';

import {
  BindingRow,
  buildAgentUserPayload,
  buildTokenPayload,
  canUseDedicatedUser,
  getTokenFor,
  getDefaultExpiry,
  getTokenWizardSteps,
  isGeneratedName,
  TokenWizardValues,
  validateTokenWizard,
} from './tokenPayload';

const template: PatTemplate = {
  key: 'site_agent',
  name: 'Site agent',
  description: '',
  required_scopes: ['ORDER.APPROVE', 'OFFERING.MANAGE_AGENT'],
  optional_features: [
    {
      key: 'sync_components',
      name: 'Sync offering components',
      description: '',
      scopes: ['OFFERING.UPDATE_COMPONENTS'],
    },
    {
      key: 'resource_api_keys',
      name: 'Resource API keys',
      description: '',
      scopes: ['RESOURCE.MANAGE_API_KEY'],
    },
  ],
  binding_types: ['offering', 'customer'],
  default_lifetime_days: 365,
  dedicated_user_types: ['offering'],
};

const target: PatTemplateTarget = {
  type: 'offering',
  uuid: 'offering-uuid',
  name: 'HPC',
  context: 'Org',
  features: ['sync_components'],
  staff_access: false,
  bindings: [{ type: 'offering', uuid: 'offering-uuid' }],
  suggested_username: '',
};

const baseValues: TokenWizardValues = {
  purpose: 'site_agent',
  target,
  features: [],
  scopes: [],
  allowed_scopes: [],
  name: 'Agent',
  expires_at: '2027-01-01',
  allowed_networks: ' 203.0.113.0/24 , ,198.51.100.7/32',
};

describe('buildTokenPayload with a template', () => {
  it('carries exactly the required scopes and binds to the target', () => {
    expect(buildTokenPayload(baseValues, template)).toEqual({
      name: 'Agent',
      expires_at: '2027-01-01',
      allowed_networks: ['203.0.113.0/24', '198.51.100.7/32'],
      scopes: ['ORDER.APPROVE', 'OFFERING.MANAGE_AGENT'],
      allowed_scopes: [{ type: 'offering', uuid: 'offering-uuid' }],
    });
  });

  it('adds the scopes of switched-on features the target allows', () => {
    const payload = buildTokenPayload(
      { ...baseValues, features: ['sync_components'] },
      template,
    );
    expect(payload.scopes).toEqual([
      'ORDER.APPROVE',
      'OFFERING.MANAGE_AGENT',
      'OFFERING.UPDATE_COMPONENTS',
    ]);
  });

  it('ignores a feature the user cannot grant on the target', () => {
    const payload = buildTokenPayload(
      { ...baseValues, features: ['resource_api_keys'] },
      template,
    );
    expect(payload.scopes).not.toContain('RESOURCE.MANAGE_API_KEY');
  });

  it('gives a staff-access target STAFF.ACCESS and no bindings', () => {
    const payload = buildTokenPayload(
      {
        ...baseValues,
        features: ['sync_components'],
        target: { ...target, staff_access: true, bindings: [] },
      },
      template,
    );
    expect(payload.scopes).toEqual([
      'ORDER.APPROVE',
      'OFFERING.MANAGE_AGENT',
      'OFFERING.UPDATE_COMPONENTS',
      'STAFF.ACCESS',
    ]);
    expect(payload.allowed_scopes).toEqual([]);
  });

  it('never leaves a token unrestricted without staff access', () => {
    // A non-staff target always has bindings; should one come without, the
    // token is bound to the target itself rather than left unrestricted.
    const payload = buildTokenPayload(
      { ...baseValues, target: { ...target, bindings: [] } },
      template,
    );
    expect(payload.allowed_scopes).not.toEqual([]);
    expect(payload.scopes).not.toContain('STAFF.ACCESS');
  });

  it('refuses to build a template token without a target', () => {
    expect(() =>
      buildTokenPayload({ ...baseValues, target: null }, template),
    ).toThrow();
  });

  it('falls back to the target itself when the backend lists no bindings', () => {
    const payload = buildTokenPayload(
      { ...baseValues, target: { ...target, bindings: [] } },
      template,
    );
    expect(payload.allowed_scopes).toEqual([
      { type: 'offering', uuid: 'offering-uuid' },
    ]);
  });

  it('ignores custom selections left over from Custom mode', () => {
    const payload = buildTokenPayload(
      {
        ...baseValues,
        scopes: ['STAFF.ACCESS'],
        allowed_scopes: [{ type: 'project', entity: { uuid: 'p', name: 'P' } }],
      },
      template,
    );
    expect(payload.scopes).not.toContain('STAFF.ACCESS');
    expect(payload.allowed_scopes).toHaveLength(1);
  });
});

describe('buildTokenPayload in Custom mode', () => {
  const custom: TokenWizardValues = {
    ...baseValues,
    purpose: 'custom',
    target: null,
    scopes: ['PROJECT.LIST', 'RESOURCE.LIST'],
    allowed_scopes: [
      { type: 'project', entity: { uuid: 'project-uuid', name: 'P' } },
      { type: 'customer', entity: null },
      { type: null, entity: null },
    ],
    allowed_networks: '',
  };

  it('sends the chosen scopes and the complete bindings only', () => {
    expect(buildTokenPayload(custom)).toEqual({
      name: 'Agent',
      expires_at: '2027-01-01',
      allowed_networks: [],
      scopes: ['PROJECT.LIST', 'RESOURCE.LIST'],
      allowed_scopes: [{ type: 'project', uuid: 'project-uuid' }],
    });
  });

  it('refuses global access together with restrictions', () => {
    expect(() =>
      buildTokenPayload({ ...custom, scopes: ['STAFF.ACCESS'] }),
    ).toThrow();
  });

  it('sends global access unrestricted when no restriction is given', () => {
    const payload = buildTokenPayload({
      ...custom,
      scopes: ['STAFF.ACCESS'],
      allowed_scopes: [],
    });
    expect(payload.scopes).toEqual(['STAFF.ACCESS']);
    expect(payload.allowed_scopes).toEqual([]);
  });
});

describe('getTokenWizardSteps', () => {
  const keys = (args) => getTokenWizardSteps(args).map((s) => s.key);

  it('asks for the purpose when there is a template', () => {
    expect(keys({ hasTemplates: true, preset: false })).toEqual([
      'purpose',
      'target',
      'permissions',
      'limits',
      'review',
    ]);
  });

  it('starts at Target when Custom is the only purpose', () => {
    expect(keys({ hasTemplates: false, preset: false })[0]).toBe('target');
  });

  it('starts at Permissions when purpose and target are given', () => {
    expect(keys({ hasTemplates: true, preset: true })).toEqual([
      'permissions',
      'limits',
      'review',
    ]);
  });
});

describe('getDefaultExpiry', () => {
  it('counts the lifetime from today', () => {
    expect(getDefaultExpiry(365, new Date(2026, 10, 21))).toBe('2027-11-21');
  });
});

describe('buildSiteAgentTokenConfig', () => {
  it('fills in the token, API URL and offering', () => {
    const config = buildSiteAgentTokenConfig({
      token: 'waldur_pat_secret',
      apiUrl: 'https://waldur.example.com/api/',
      offering: { uuid: 'abc123', name: 'HPC: main' },
    });
    expect(config).toContain('waldur_api_token: "waldur_pat_secret"');
    expect(config).toContain(
      'waldur_api_url: "https://waldur.example.com/api/"',
    );
    expect(config).toContain('waldur_offering_uuid: "abc123"');
    expect(config).toContain('name: "HPC: main"');
  });
});

describe('validateTokenWizard', () => {
  const describe_ = (row: BindingRow) => row.entity?.name ?? '';
  const bindingTargets = { 'PROJECT.LIST': ['project'] };

  it('asks for a target once the Target step is reached', () => {
    const values = { ...baseValues, target: null };
    expect(
      validateTokenWizard(
        { ...values, step: 'purpose' },
        [template],
        bindingTargets,
        describe_,
      ),
    ).toEqual({});
    expect(
      validateTokenWizard(
        { ...values, step: 'review' },
        [template],
        bindingTargets,
        describe_,
      ).target,
    ).toBeTruthy();
  });

  it('names a custom binding none of the chosen permissions can take', () => {
    const errors = validateTokenWizard(
      {
        ...baseValues,
        purpose: 'custom',
        target: null,
        step: 'permissions',
        scopes: ['PROJECT.LIST'],
        allowed_scopes: [
          { type: 'customer', entity: { uuid: 'c', name: 'Big Org' } },
          { type: 'project', entity: { uuid: 'p', name: 'Fine project' } },
        ],
      },
      [template],
      bindingTargets,
      describe_,
    );
    expect(errors.restrictions).toContain('Big Org');
    expect(errors.restrictions).not.toContain('Fine project');
  });

  it('asks for permissions in Custom mode', () => {
    expect(
      validateTokenWizard(
        { ...baseValues, purpose: 'custom', step: 'review', scopes: [] },
        [template],
        bindingTargets,
        describe_,
      ).scopes,
    ).toBeTruthy();
  });
});

describe('validateTokenWizard, custom restrictions and limits', () => {
  const describe_ = (row: BindingRow) => row.entity?.name ?? '';
  const custom: TokenWizardValues = {
    ...baseValues,
    purpose: 'custom',
    target: null,
    scopes: ['PROJECT.LIST'],
    allowed_scopes: [],
  };

  it('refuses global access with any restriction row, filled in or not', () => {
    for (const row of [
      { type: null, entity: null },
      { type: 'project', entity: { uuid: 'p', name: 'Proj One' } },
    ]) {
      const errors = validateTokenWizard(
        {
          ...custom,
          step: 'review',
          scopes: ['STAFF.ACCESS'],
          allowed_scopes: [row],
        },
        [template],
        { 'PROJECT.LIST': ['project'] },
        describe_,
      );
      expect(errors.restrictions).toBeTruthy();
    }
  });

  it('asks to complete or remove a half-filled restriction', () => {
    const errors = validateTokenWizard(
      {
        ...custom,
        step: 'target',
        allowed_scopes: [{ type: 'project', entity: null }],
      },
      [template],
      {},
      describe_,
    );
    expect(errors.restrictions).toBeTruthy();
  });

  it('asks for a name and an expiry once Limits is reached', () => {
    const values = { ...custom, name: '', expires_at: '' };
    expect(
      validateTokenWizard(
        { ...values, step: 'permissions' },
        [template],
        {},
        describe_,
      ),
    ).toEqual({});
    const errors = validateTokenWizard(
      { ...values, step: 'review' },
      [template],
      {},
      describe_,
    );
    expect(errors.name).toBeTruthy();
    expect(errors.expires_at).toBeTruthy();
  });
});

describe('isGeneratedName', () => {
  it('replaces only a name the wizard made up', () => {
    expect(
      isGeneratedName({
        name: 'Site agent: HPC',
        generatedName: 'Site agent: HPC',
      }),
    ).toBe(true);
    expect(isGeneratedName({ name: '' })).toBe(true);
    // Typed by hand, even if it looks like a generated one.
    expect(isGeneratedName({ name: 'Site agent: my cluster' })).toBe(false);
    expect(
      isGeneratedName({
        name: 'Site agent: HPC (prod)',
        generatedName: 'Site agent: HPC',
      }),
    ).toBe(false);
  });
});

describe('dedicated agent user', () => {
  const staffTarget = { ...target, staff_access: true, bindings: [] };

  it('offers the choice to staff only, for the types the template names', () => {
    expect(canUseDedicatedUser(template, target, true)).toBe(true);
    expect(canUseDedicatedUser(template, target, false)).toBe(false);
    expect(
      canUseDedicatedUser(
        { ...template, dedicated_user_types: [] },
        target,
        true,
      ),
    ).toBe(false);
  });

  it('defaults to a dedicated user only where the alternative is staff access', () => {
    expect(getTokenFor({ target: staffTarget }, template, true)).toBe(
      'agent_user',
    );
    expect(getTokenFor({ target }, template, true)).toBe('me');
    expect(
      getTokenFor({ target: staffTarget, tokenFor: 'me' }, template, true),
    ).toBe('me');
    // Not staff: always the user themselves.
    expect(
      getTokenFor({ target, tokenFor: 'agent_user' }, template, false),
    ).toBe('me');
  });

  it('sends the template, target, grantable features and limits', () => {
    expect(
      buildAgentUserPayload(
        {
          ...baseValues,
          target: staffTarget,
          features: ['sync_components', 'resource_api_keys'],
          agentUsername: '  ',
        },
        template,
      ),
    ).toEqual({
      template: 'site_agent',
      target_type: 'offering',
      target_uuid: 'offering-uuid',
      features: ['sync_components'],
      name: 'Agent',
      expires_at: '2027-01-01',
      allowed_networks: ['203.0.113.0/24', '198.51.100.7/32'],
    });
  });

  it('passes a chosen username', () => {
    expect(
      buildAgentUserPayload(
        { ...baseValues, agentUsername: 'hpc-agent' },
        template,
      ).username,
    ).toBe('hpc-agent');
  });
});

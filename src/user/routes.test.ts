import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { states } from './routes';

const stateByName = Object.fromEntries(
  states.map((state) => [state.name, state]),
);

const user = { is_staff: false, is_support: false, permissions: [] };

const canEnter = (name: string) =>
  stateByName[name].data.permissions.every((permission) =>
    permission({ workspace: { user } }),
  );

describe('connected apps tab', () => {
  const core = ENV.plugins.WALDUR_CORE;
  const saved = {
    MCP_ENABLED: core.MCP_ENABLED,
    PAT_ENABLED: core.PAT_ENABLED,
    FREEIPA_ENABLED: core.FREEIPA_ENABLED,
    AUTHENTICATION_METHODS: core.AUTHENTICATION_METHODS,
    FEATURES: ENV.FEATURES,
  };

  beforeEach(() => {
    // Every other credentials tab is hidden from this user.
    core.PAT_ENABLED = false;
    core.FREEIPA_ENABLED = false;
    core.AUTHENTICATION_METHODS = [];
    ENV.FEATURES = {
      user: {
        ssh_keys: false,
        conceal_remote_accounts: true,
        conceal_api_token: true,
      },
    } as any;
  });

  afterEach(() => {
    const { FEATURES, ...settings } = saved;
    Object.assign(core, settings);
    ENV.FEATURES = FEATURES;
  });

  it('is shown when MCP is enabled, along with the credentials section', () => {
    core.MCP_ENABLED = true;
    expect(canEnter('profile-connected-apps')).toBe(true);
    expect(canEnter('profile-credentials')).toBe(true);
  });

  it('is hidden when MCP is disabled', () => {
    core.MCP_ENABLED = false;
    expect(canEnter('profile-connected-apps')).toBe(false);
    expect(canEnter('profile-credentials')).toBe(false);
  });

  it('does not depend on personal access tokens', () => {
    core.MCP_ENABLED = true;
    expect(canEnter('profile-personal-access-tokens')).toBe(false);
    expect(canEnter('profile-connected-apps')).toBe(true);
  });
});

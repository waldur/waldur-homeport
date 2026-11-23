import { describe, expect, it } from 'vitest';

import {
  isSiteAgentOfferingType,
  LEGACY_SITE_AGENT_PLUGIN,
  offersSlurmPeriodicPolicy,
  SITE_AGENT_PLUGIN,
} from './constants';

describe('isSiteAgentOfferingType', () => {
  it('accepts the current and the legacy value', () => {
    expect(isSiteAgentOfferingType(SITE_AGENT_PLUGIN)).toBe(true);
    expect(isSiteAgentOfferingType(LEGACY_SITE_AGENT_PLUGIN)).toBe(true);
  });

  it('rejects other types and empty values', () => {
    expect(isSiteAgentOfferingType('Marketplace.Basic')).toBe(false);
    expect(isSiteAgentOfferingType('')).toBe(false);
    expect(isSiteAgentOfferingType(undefined)).toBe(false);
    expect(isSiteAgentOfferingType(null)).toBe(false);
  });
});

describe('offersSlurmPeriodicPolicy', () => {
  it.each(['Marketplace.SiteAgent', 'Marketplace.Slurm'])(
    'is on for a %s offering with the switch on',
    (type) => {
      expect(
        offersSlurmPeriodicPolicy({
          type,
          plugin_options: { slurm_periodic_policy_enabled: true },
        }),
      ).toBe(true);
    },
  );

  it('is off while the switch is off', () => {
    expect(
      offersSlurmPeriodicPolicy({
        type: 'Marketplace.SiteAgent',
        plugin_options: {},
      }),
    ).toBe(false);
  });

  // A value stored before the switch was limited to site agents is kept,
  // but opens nothing on another offering type.
  it('is off for other offering types even with the switch stored on', () => {
    expect(
      offersSlurmPeriodicPolicy({
        type: 'Marketplace.Basic',
        plugin_options: { slurm_periodic_policy_enabled: true },
      }),
    ).toBe(false);
  });
});

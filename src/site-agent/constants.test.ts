import { describe, expect, it } from 'vitest';

import {
  isSiteAgentOfferingType,
  LEGACY_SITE_AGENT_PLUGIN,
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

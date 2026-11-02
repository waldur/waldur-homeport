import { describe, expect, it } from 'vitest';

import {
  LEGACY_SITE_AGENT_PLUGIN,
  SITE_AGENT_PLUGIN,
} from '@/site-agent/constants';

import {
  getCreatableOfferings,
  getLabel,
  getOfferingTypeFilterOptions,
} from './registry';

describe('offering type registry', () => {
  it('lists the site-agent type once in filters, under the current name', () => {
    const siteAgentOptions = getOfferingTypeFilterOptions().filter(
      (option) => option.label === getLabel(SITE_AGENT_PLUGIN),
    );
    expect(siteAgentOptions.map((option) => option.value)).toEqual([
      SITE_AGENT_PLUGIN,
    ]);
  });

  it('creates site-agent offerings under the current name only', () => {
    const values = getCreatableOfferings().map((option) => option.value);
    expect(values).toContain(SITE_AGENT_PLUGIN);
    expect(values).not.toContain(LEGACY_SITE_AGENT_PLUGIN);
  });

  it('labels offerings under either name the same way', () => {
    expect(getLabel(LEGACY_SITE_AGENT_PLUGIN)).toBe(
      getLabel(SITE_AGENT_PLUGIN),
    );
  });
});

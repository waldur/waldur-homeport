import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { translate } from './translate';

describe('translate (domain message overrides)', () => {
  afterEach(() => {
    (ENV.plugins.WALDUR_CORE as any).TRANSLATION_DOMAIN = undefined;
  });

  it('leaves messages unchanged when no translation domain is configured', () => {
    expect(translate('Marketplace')).toBe('Marketplace');
  });

  it('swaps marketplace terminology for the service_catalogue domain', () => {
    (ENV.plugins.WALDUR_CORE as any).TRANSLATION_DOMAIN = 'service_catalogue';
    expect(translate('Marketplace')).toBe('Service catalog');
    expect(translate('Explore marketplace')).toBe('Explore service catalog');
  });

  it('swaps marketplace terminology for the academic domain, including its own overrides', () => {
    (ENV.plugins.WALDUR_CORE as any).TRANSLATION_DOMAIN = 'academic';
    expect(translate('Marketplace')).toBe('Service catalog');
    expect(translate('Purchase')).toBe('Request');
  });

  it('falls back to the original message for an unknown domain', () => {
    (ENV.plugins.WALDUR_CORE as any).TRANSLATION_DOMAIN = 'not-a-real-domain';
    expect(translate('Marketplace')).toBe('Marketplace');
  });
});

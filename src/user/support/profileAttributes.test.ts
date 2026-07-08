import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { isProfileAttributeEnabled } from './profileAttributes';

describe('isProfileAttributeEnabled', () => {
  const originalPlugins = ENV.plugins;

  beforeEach(() => {
    ENV.plugins = { WALDUR_CORE: {} } as any;
  });

  afterEach(() => {
    ENV.plugins = originalPlugins;
  });

  it('always enables core attributes regardless of configuration', () => {
    ENV.plugins.WALDUR_CORE.ENABLED_USER_PROFILE_ATTRIBUTES = [];

    expect(isProfileAttributeEnabled('first_name')).toBe(true);
    expect(isProfileAttributeEnabled('last_name')).toBe(true);
    expect(isProfileAttributeEnabled('email')).toBe(true);
    expect(isProfileAttributeEnabled('full_name')).toBe(true);
    expect(isProfileAttributeEnabled('username')).toBe(true);
  });

  it('disables a configurable attribute that is not listed', () => {
    ENV.plugins.WALDUR_CORE.ENABLED_USER_PROFILE_ATTRIBUTES = [];

    expect(isProfileAttributeEnabled('civil_number')).toBe(false);
    expect(isProfileAttributeEnabled('address')).toBe(false);
  });

  it('enables a configurable attribute when it is listed', () => {
    ENV.plugins.WALDUR_CORE.ENABLED_USER_PROFILE_ATTRIBUTES = [
      'civil_number',
      'address',
    ];

    expect(isProfileAttributeEnabled('civil_number')).toBe(true);
    expect(isProfileAttributeEnabled('address')).toBe(true);
    expect(isProfileAttributeEnabled('gender')).toBe(false);
  });

  it('treats missing configuration as no configurable attributes enabled', () => {
    // ENABLED_USER_PROFILE_ATTRIBUTES unset entirely.
    expect(isProfileAttributeEnabled('email')).toBe(true);
    expect(isProfileAttributeEnabled('civil_number')).toBe(false);
  });
});

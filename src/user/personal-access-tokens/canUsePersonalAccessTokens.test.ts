import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { canUsePersonalAccessTokens } from './canUsePersonalAccessTokens';

describe('canUsePersonalAccessTokens', () => {
  const original = ENV.plugins.WALDUR_CORE.PAT_ENABLED;

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.PAT_ENABLED = original;
  });

  it.each([
    // [PAT_ENABLED, flag, allowed]
    [true, true, true],
    [true, false, true],
    [false, true, true],
    [false, false, false],
  ])('PAT_ENABLED=%s, flag=%s → %s', (enabled, flag, allowed) => {
    ENV.plugins.WALDUR_CORE.PAT_ENABLED = enabled;
    expect(
      canUsePersonalAccessTokens({ can_use_personal_access_tokens: flag }),
    ).toBe(allowed);
  });

  it('gives staff no exemption while tokens are off', () => {
    ENV.plugins.WALDUR_CORE.PAT_ENABLED = false;
    const staff = { is_staff: true, can_use_personal_access_tokens: false };
    expect(canUsePersonalAccessTokens(staff)).toBe(false);
  });

  it('refuses without a user', () => {
    ENV.plugins.WALDUR_CORE.PAT_ENABLED = true;
    expect(canUsePersonalAccessTokens(null)).toBe(false);
  });
});

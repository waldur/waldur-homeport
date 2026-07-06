import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';

import {
  isAnonymousAssistantEnabled,
  isAnonymousVisitor,
  isAssistantEnabled,
  isLLMChatAllowedForUser,
} from './utils';

describe('anonymous assistant gating', () => {
  beforeEach(() => {
    (ENV as any).plugins.WALDUR_CORE = {
      AI_ASSISTANT_ENABLED_ROLES: 'anonymous',
    };
    (isFeatureVisible as any).mockReturnValue(true);
  });

  it('is enabled when mode is anonymous and feature is on', () => {
    expect(isAnonymousAssistantEnabled()).toBe(true);
  });

  it('is disabled when the feature flag is off', () => {
    (isFeatureVisible as any).mockReturnValue(false);
    expect(isAnonymousAssistantEnabled()).toBe(false);
  });

  it('is disabled when mode is not anonymous', () => {
    (ENV as any).plugins.WALDUR_CORE = { AI_ASSISTANT_ENABLED_ROLES: 'all' };
    expect(isAnonymousAssistantEnabled()).toBe(false);
  });

  it('isAssistantEnabled is true for anonymous mode without a user', () => {
    expect(isAssistantEnabled(undefined)).toBe(true);
  });

  it('is enabled for everyone — including a logged-in user — in anonymous mode', () => {
    expect(isAssistantEnabled({ is_staff: true } as any)).toBe(true);
  });

  // 'anonymous' is a superset of 'all': a logged-in user gets the full
  // authenticated assistant, only the anonymous-visitor panel is gated separately.
  it('allows the authenticated assistant for a logged-in user in anonymous mode', () => {
    expect(
      isLLMChatAllowedForUser({ is_staff: false } as any, 'anonymous'),
    ).toBe(true);
  });

  it('does not treat an anonymous visitor as an allowed authenticated user', () => {
    expect(isLLMChatAllowedForUser(undefined, 'anonymous')).toBe(false);
  });

  it('isAnonymousVisitor is true for a logged-out visitor in anonymous mode', () => {
    expect(isAnonymousVisitor(undefined)).toBe(true);
  });

  it('isAnonymousVisitor is false for a logged-in user (they get the full assistant)', () => {
    expect(isAnonymousVisitor({ is_staff: false } as any)).toBe(false);
  });

  it('isAnonymousVisitor is false when anonymous mode is off', () => {
    (ENV as any).plugins.WALDUR_CORE = { AI_ASSISTANT_ENABLED_ROLES: 'all' };
    expect(isAnonymousVisitor(undefined)).toBe(false);
  });
});

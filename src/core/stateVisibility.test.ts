import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { router } from '@/router';

import { isStateVisible } from './stateVisibility';

const registry = {
  layout: { name: 'layout' },
  'admin-matrix-chat': {
    name: 'admin-matrix-chat',
    parent: 'layout',
    data: { feature: 'project.show_matrix_chat' },
  },
  'admin-dashboard': { name: 'admin-dashboard', parent: 'layout' },
  profile: { name: 'profile', parent: 'layout' },
  // Dot-notation nesting carries no explicit `parent` field.
  'profile.notifications': {
    name: 'profile.notifications',
    data: { feature: 'user.notifications' },
  },
  'profile.details': { name: 'profile.details' },
  // A child of a gated parent, gated on a flag of its own.
  'reporting-proposals': {
    name: 'reporting-proposals',
    parent: 'layout',
    data: { feature: 'marketplace.show_call_management_functionality' },
  },
  'reporting-call-performance': {
    name: 'reporting-call-performance',
    parent: 'reporting-proposals',
    data: { feature: 'marketplace.show_experimental_ui_components' },
  },
};

beforeEach(() => {
  vi.mocked(router.stateRegistry.get).mockImplementation(
    (name) => registry[name as string],
  );
  (ENV as any).FEATURES = {
    project: { show_matrix_chat: true },
    user: { notifications: false },
    marketplace: {
      show_call_management_functionality: false,
      show_experimental_ui_components: true,
    },
  };
});

describe('isStateVisible', () => {
  it('is true for a state carrying no feature', () => {
    expect(isStateVisible('admin-dashboard')).toBe(true);
  });

  it('follows the feature of the state itself', () => {
    expect(isStateVisible('admin-matrix-chat')).toBe(true);
    (ENV as any).FEATURES.project.show_matrix_chat = false;
    expect(isStateVisible('admin-matrix-chat')).toBe(false);
  });

  it('follows the feature of a dot-notation parent', () => {
    expect(isStateVisible('profile.notifications')).toBe(false);
    expect(isStateVisible('profile.details')).toBe(true);
  });

  // The child's own flag is on, so only walking the ancestors catches this.
  it('is false when an ancestor is gated off', () => {
    expect(isStateVisible('reporting-call-performance')).toBe(false);
  });

  // Concealment is for switched-off features; a typo must stay loud.
  it('is true for an unknown state', () => {
    expect(isStateVisible('no-such-state')).toBe(true);
    expect(isStateVisible(undefined)).toBe(true);
  });
});

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRobotAccountFields } from './CreateRobotAccountDialog';

const isUsernameDisabled = (resource) => {
  const { result } = renderHook(() => useRobotAccountFields(resource));
  return result.current.find((field) => field.name === 'username').disabled;
};

describe('useRobotAccountFields', () => {
  it('locks the username when the provider policy is inherited', () => {
    expect(
      isUsernameDisabled({
        project_uuid: 'project-uuid',
        offering_plugin_options: {},
        offering_account_settings: {
          username_generation_policy: {
            value: 'service_provider',
            source: 'provider',
          },
        },
      }),
    ).toBe(true);
  });

  it('allows a username when the effective policy is not service provider', () => {
    expect(
      isUsernameDisabled({
        project_uuid: 'project-uuid',
        offering_plugin_options: {
          username_generation_policy: 'service_provider',
        },
        offering_account_settings: {
          username_generation_policy: {
            value: 'anonymized',
            source: 'provider',
          },
        },
      }),
    ).toBe(false);
  });

  it('falls back to the offering plugin option', () => {
    expect(
      isUsernameDisabled({
        project_uuid: 'project-uuid',
        offering_plugin_options: {
          username_generation_policy: 'service_provider',
        },
      }),
    ).toBe(true);
  });
});

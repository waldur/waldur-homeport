import { describe, expect, it, vi } from 'vitest';

import { getProtectedFieldProps } from './getProtectedFieldProps';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(() => true),
}));

describe('getProtectedFieldProps', () => {
  it('returns true for IDP managed fields', () => {
    const user = {
      identity_provider_fields: ['first_name'],
      registration_method: 'default',
    } as any;

    const result = getProtectedFieldProps(user, 'first_name', false, 'John');

    expect(result.isProtected).toBe(true);
    expect(result.tooltip).toBe('Information is coming from identity provider');
    expect(result.iconNode).toBeDefined();
  });

  it('uses attribute sources if available', () => {
    const user = {
      identity_provider_fields: ['job_title'],
      attribute_sources: {
        job_title: {
          source: 'tara',
          timestamp: '2023-01-01',
        },
      },
    } as any;

    const result = getProtectedFieldProps(
      user,
      'job_title',
      false,
      'Developer',
    );

    expect(result.tooltip).toBe(
      'Managed by Tara. Last synced: 1 Jan 2023, 12:00 AM',
    );
  });

  it('returns renderValue override when required IDP field is missing', () => {
    const user = {
      identity_provider_fields: ['email'],
    } as any;

    const result = getProtectedFieldProps(user, 'email', true, '');

    expect(result.renderValue).toBeDefined();
  });

  it('does not return renderValue if field is not required', () => {
    const user = {
      identity_provider_fields: ['last_name'],
    } as any;

    const result = getProtectedFieldProps(user, 'last_name', false, '');

    expect(result.renderValue).toBeUndefined();
  });
});

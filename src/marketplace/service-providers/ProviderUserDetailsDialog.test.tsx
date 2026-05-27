import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DASH_ESCAPE_CODE } from '@/table/constants';

import {
  formatValue,
  ProviderUserDetailsDialog,
  SP_USER_FIELDS,
} from './ProviderUserDetailsDialog';

vi.mock('@/core/config', () => ({
  ENV: {
    plugins: { WALDUR_CORE: {} },
    roles: [],
    FEATURES: {},
  },
}));

const renderDialog = (user: Record<string, unknown>) =>
  render(<ProviderUserDetailsDialog resolve={{ user: user as any }} />);

describe('formatValue', () => {
  it('returns mdash for null', () => {
    expect(formatValue(null)).toBe(DASH_ESCAPE_CODE);
  });

  it('returns mdash for undefined', () => {
    expect(formatValue(undefined)).toBe(DASH_ESCAPE_CODE);
  });

  it('returns mdash for empty string', () => {
    expect(formatValue('')).toBe(DASH_ESCAPE_CODE);
  });

  it('returns mdash for empty array', () => {
    expect(formatValue([])).toBe(DASH_ESCAPE_CODE);
  });

  it('joins non-empty array with commas', () => {
    expect(formatValue(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('returns string as-is', () => {
    expect(formatValue('hello')).toBe('hello');
  });

  it('converts number to string', () => {
    expect(formatValue(42)).toBe('42');
  });
});

describe('SP_USER_FIELDS', () => {
  it('contains expected field keys', () => {
    const keys = SP_USER_FIELDS.map((f) => f.key);
    expect(keys).toContain('full_name');
    expect(keys).toContain('email');
    expect(keys).toContain('organization_registry_code');
    expect(keys).toContain('identity_source');
  });

  it('has unique keys', () => {
    const keys = SP_USER_FIELDS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all labels return non-empty strings', () => {
    for (const field of SP_USER_FIELDS) {
      expect(field.label()).toBeTruthy();
    }
  });
});

describe('ProviderUserDetailsDialog', () => {
  it('renders all field labels even when user data is empty', () => {
    renderDialog({});
    for (const field of SP_USER_FIELDS) {
      expect(screen.getByText(field.label())).toBeInTheDocument();
    }
  });

  it('renders populated field values', () => {
    renderDialog({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      organization: 'ACME Corp',
    });
    // full_name appears in both subtitle and field value
    expect(screen.getAllByText('Jane Doe')).toHaveLength(2);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('ACME Corp')).toBeInTheDocument();
  });

  it('renders projects count when provided', () => {
    renderDialog({ projects_count: 5 });
    expect(screen.getByText('5 projects')).toBeInTheDocument();
  });

  it('renders active/inactive status', () => {
    renderDialog({ is_active: false });
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

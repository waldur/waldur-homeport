import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  ProviderUserDetailsDialog,
  SP_USER_FIELDS,
} from './ProviderUserDetailsDialog';

const renderDialog = (user: Record<string, unknown>) =>
  render(<ProviderUserDetailsDialog resolve={{ user: user as any }} />);

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

  it('formats birth_date and affiliations with propVal', () => {
    renderDialog({
      birth_date: '1995-12-25',
      affiliations: ['Staff', 'Researcher'],
    });
    expect(screen.getByText('25 Dec 1995')).toBeInTheDocument();
    expect(screen.getByText('Staff, Researcher')).toBeInTheDocument();
  });

  it('renders active ISDs when feature is enabled', () => {
    ENV.FEATURES = { user: { show_identity_bridge: true } } as any;
    renderDialog({ active_isds: ['isd:eduperson', 'isd:haka'] });
    expect(screen.getByText('Active ISDs')).toBeInTheDocument();
    expect(screen.getByText('Eduperson')).toBeInTheDocument();
    expect(screen.getByText('Haka')).toBeInTheDocument();
  });
});

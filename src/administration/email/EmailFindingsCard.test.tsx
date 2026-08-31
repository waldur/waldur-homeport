import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import type { EmailFinding } from './api';
import { EmailFindingsCard } from './EmailFindingsCard';

const finding = (level: string, code: string, title: string): EmailFinding => ({
  level,
  code,
  title,
  detail: `${code} detail`,
  remediation: `${code} remediation`,
});

const findings = [
  finding('OK', 'host_configured', 'SMTP relay is configured'),
  finding('WARNING', 'timeout_unset', 'No SMTP timeout is set'),
  finding('ERROR', 'notifications_all_disabled', 'Every notification is off'),
];

describe('EmailFindingsCard', () => {
  it('counts only the findings that need action', () => {
    renderWithProviders(<EmailFindingsCard findings={findings} />);
    expect(screen.getByText('2 problems detected')).toBeInTheDocument();
  });

  it('says so when every check passes', () => {
    renderWithProviders(<EmailFindingsCard findings={[findings[0]]} />);
    expect(screen.getByText('No problems detected')).toBeInTheDocument();
  });

  it('puts the problems above the passing checks', () => {
    renderWithProviders(<EmailFindingsCard findings={findings} />);
    const rows = screen.getAllByRole('listitem').map((row) => row.textContent);
    const rowWith = (title: string) =>
      rows.findIndex((row) => row?.startsWith(title));
    expect(rowWith('Every notification is off')).toBeLessThan(
      rowWith('SMTP relay is configured'),
    );
    expect(rowWith('No SMTP timeout is set')).toBeLessThan(
      rowWith('SMTP relay is configured'),
    );
  });

  it('shows the detail and the remediation for each finding', () => {
    renderWithProviders(<EmailFindingsCard findings={findings} />);
    expect(screen.getByText('timeout_unset detail')).toBeInTheDocument();
    expect(screen.getByText('timeout_unset remediation')).toBeInTheDocument();
  });
});

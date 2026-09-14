import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleHygieneReport } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { getRoleHygieneReport } from '../../api';

import { RoleHygienePage } from './RoleHygienePage';

vi.mock('../../api');

// The real table needs the Redux store; the page only hands it findings and a
// severity.
vi.mock('./RoleHygieneTable', () => ({
  RoleHygieneTable: ({ findings, severity, onSelectSeverity }) => (
    <div data-testid="findings-table">
      {`${findings.length} findings, severity=${severity ?? 'all'}`}
      <button type="button" onClick={() => onSelectSeverity('error')}>
        pick errors
      </button>
      <button type="button" onClick={() => onSelectSeverity(undefined)}>
        pick all
      </button>
    </div>
  ),
}));

const report = (overrides: Partial<RoleHygieneReport> = {}) =>
  ({
    roles_checked: 12,
    roles_with_findings: 2,
    error_count: 1,
    warning_count: 1,
    info_count: 0,
    findings: [
      {
        check: 'name-not-a-code',
        severity: 'error',
        role_uuid: 'uuid-1',
        role_name: 'Researcher (project member)',
        role_description: 'Researcher',
        scope_type: 'project',
        is_system_role: false,
        message: 'Name is free-form text.',
        details: {},
      },
      {
        check: 'global-custom-role',
        severity: 'warning',
        role_uuid: 'uuid-2',
        role_name: 'PROJECT.REVIEWER',
        role_description: 'Reviewer',
        scope_type: 'project',
        is_system_role: false,
        message: 'Offered in every organization.',
        details: { organization_count: 3 },
      },
    ],
    ...overrides,
  }) as RoleHygieneReport;

describe('RoleHygienePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows how many roles were checked and how many findings each severity has', async () => {
    vi.mocked(getRoleHygieneReport).mockResolvedValue(report());

    renderWithProviders(<RoleHygienePage />);

    expect(await screen.findByText('Roles checked')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByTestId('findings-table')).toHaveTextContent(
      '2 findings, severity=all',
    );
  });

  it('narrows the table to the severity the tabs select', async () => {
    const user = userEvent.setup();
    vi.mocked(getRoleHygieneReport).mockResolvedValue(report());

    renderWithProviders(<RoleHygienePage />);

    await user.click(await screen.findByText('pick errors'));
    expect(screen.getByTestId('findings-table')).toHaveTextContent(
      'severity=error',
    );

    await user.click(screen.getByText('pick all'));
    expect(screen.getByTestId('findings-table')).toHaveTextContent(
      'severity=all',
    );
  });

  it('replaces the table with an empty state when nothing is wrong', async () => {
    vi.mocked(getRoleHygieneReport).mockResolvedValue(
      report({ findings: [], error_count: 0, warning_count: 0 }),
    );

    renderWithProviders(<RoleHygienePage />);

    expect(await screen.findByText('Nothing to clean up')).toBeInTheDocument();
    expect(screen.queryByTestId('findings-table')).not.toBeInTheDocument();
  });

  it('offers a reload when the report cannot be read', async () => {
    vi.mocked(getRoleHygieneReport).mockRejectedValue(new Error('403'));

    renderWithProviders(<RoleHygienePage />);

    expect(
      await screen.findByText('Unable to load the role hygiene report.'),
    ).toBeInTheDocument();
  });
});

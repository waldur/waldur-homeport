import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Project } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { renderWithProviders } from '@/test/harness';

import { AddPrepaidPeriodDialog } from './AddPrepaidPeriodDialog';
import { PrepaidConstraints } from './prepaidConstraints';

// Helper to create fixtures
const createFixtures = () => {
  const constraints: PrepaidConstraints = {
    min_prepaid_duration: 1,
    max_prepaid_duration: null,
    prepaid_duration_step: 1,
  };
  const project: Project = {
    url: '/api/projects/1/',
    uuid: 'uuid-project-1',
    name: 'Test Project',
  };
  return { constraints, project };
};

const renderComponent = (props) => {
  const onSubmit = vi.fn();
  const resolve = vi.fn();
  const { constraints, project, startDate } = props;
  renderWithProviders(
    <AddPrepaidPeriodDialog
      constraints={constraints}
      project={project}
      startDate={startDate}
      onSubmit={onSubmit}
      resolve={resolve}
    />,
  );
  return { onSubmit, resolve };
};

// Clean up DOM after each test
afterEach(cleanup);

describe('AddPrepaidPeriodDialog', () => {
  it('renders with default duration and calculates correct end date', () => {
    // Freeze time to make test deterministic
    const today = '2024-01-15';
    vi.setSystemTime(new Date(today));
    const { constraints, project } = createFixtures();
    constraints.min_prepaid_duration = 3; // Set a different min duration
    renderComponent({ constraints, project });

    const expectedEndDateISO = DateTime.fromISO(today)
      .plus({ months: 3 })
      .toISODate();
    const formattedExpectedEndDate = formatDate(expectedEndDateISO);

    expect(
      screen.getByText(/Your prepaid period will be from/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(formattedExpectedEndDate)),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('uses provided start date for calculations', () => {
    const startDate = '2025-02-01';
    const { constraints, project } = createFixtures();
    constraints.min_prepaid_duration = 1;
    renderComponent({ constraints, project, startDate });

    const expectedEndDateISO = DateTime.fromISO(startDate)
      .plus({ months: 1 })
      .toISODate();
    const formattedStartDate = formatDate(startDate);
    const formattedExpectedEndDate = formatDate(expectedEndDateISO);

    expect(
      screen.getByText(new RegExp(formattedStartDate)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(formattedExpectedEndDate)),
    ).toBeInTheDocument();
  });

  it('submits with correct end date for fixed duration', async () => {
    const user = userEvent.setup();
    const today = '2024-01-15';
    vi.setSystemTime(new Date(today));

    const { constraints, project } = createFixtures();
    constraints.min_prepaid_duration = 2;

    const { onSubmit, resolve } = renderComponent({ constraints, project });

    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    const expectedEndDate = DateTime.fromISO(today)
      .plus({ months: 2 })
      .toISODate();

    expect(onSubmit).toHaveBeenCalledWith({ end_date: expectedEndDate });
    expect(resolve).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('caps month options based on project end date', async () => {
    const user = userEvent.setup();
    const today = '2024-01-15';
    vi.setSystemTime(new Date(today));

    const { constraints, project } = createFixtures();
    project.end_date = '2024-04-10'; // ~3 months from now

    renderComponent({ constraints, project });

    // Open the select to see options
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // Options should be 1, 2 months only
    expect(screen.getByRole('option', { name: '1 month' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '2 months' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '3 months' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Custom range' }),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});

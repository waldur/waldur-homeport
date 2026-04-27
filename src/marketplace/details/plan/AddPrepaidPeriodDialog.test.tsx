import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Project } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';

import { AddPrepaidPeriodDialog } from './AddPrepaidPeriodDialog';
import { PrepaidConstraints } from './prepaidConstraints';

// Mock child components to isolate our component's logic
vi.mock('@/form/DateField', () => ({
  // Render props as data-attributes so we can assert them
  DateField: (props) => (
    <input
      type="date"
      data-testid="date-field"
      data-mindate={props.minDate}
      data-maxdate={props.maxDate}
      value={props.input.value}
      onChange={(e) => props.input.onChange(e.target.value)}
    />
  ),
}));

vi.mock('@/form/SelectField', () => ({
  SelectField: (props) => (
    <select
      data-testid="select-field"
      value={props.input.value}
      onChange={(e) => props.input.onChange(e.target.value)}
    >
      {props.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ children, footer }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

// Mock other simple components
vi.mock('@/form', () => ({
  SubmitButton: ({ label }) => <button>{label}</button>,
}));
vi.mock('@/modal/CloseDialogButton', () => ({
  CloseDialogButton: () => <button>Close</button>,
}));
vi.mock('@/i18n', () => ({
  translate: (key: string, context?: any) => {
    if (context) {
      return key.replace(/\{(\w+)\}/g, (match, prop) => context[prop] || match);
    }
    return key;
  },
}));

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
  render(
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

  it('caps month options based on project end date', () => {
    const today = '2024-01-15';
    vi.setSystemTime(new Date(today));

    const { constraints, project } = createFixtures();
    project.end_date = '2024-04-10'; // ~3 months from now

    renderComponent({ constraints, project });

    const select = screen.getByTestId('select-field');
    const options = Array.from(select.querySelectorAll('option'));
    const monthValues = options.map((opt) => opt.value);

    // Should include 1, 2 months only (no custom range)
    expect(monthValues).toEqual(['1', '2']);
    vi.useRealTimers();
  });
});

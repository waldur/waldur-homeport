import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CallProposalRolesSection } from './CallProposalRolesSection';

const { rows, dropdowns } = vi.hoisted(() => ({
  rows: [
    {
      uuid: 'lead',
      name: 'Lead rapporteur',
      eligible_from: 'call_role:panel_member',
      min_holders: 1,
      max_holders: 1,
      allows_lead: true,
      description: 'Writes the consolidated report.',
      eligible_count: 0,
      holders_warning:
        "The call has no panel members, but each proposal needs 1 holder of the role 'Lead rapporteur': add panel members in the call's Team tab.",
    },
    {
      uuid: 'external',
      name: 'External expert',
      eligible_from: 'any_user',
      min_holders: 2,
      max_holders: null,
      allows_lead: false,
      description: '',
      eligible_count: null,
      holders_warning: null,
    },
  ] as any[],
  dropdowns: { value: [] as any[] },
}));

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn() }),
}));

vi.mock('@/table/Table', () => ({
  default: ({ columns, rowActions, title }) => (
    <>
      <h2>{title}</h2>
      {rows.map((row) => (
        <div key={row.uuid} data-testid={`row-${row.uuid}`}>
          {columns.map((column, index) => (
            <span key={index}>{column.render({ row })}</span>
          ))}
          {rowActions({ row, fetch: vi.fn() })}
        </div>
      ))}
    </>
  ),
}));

vi.mock('@/table/ActionsDropdown', () => ({
  ActionsDropdown: (props) => {
    dropdowns.value.push(props);
    return null;
  },
}));

const call = { uuid: 'call-uuid', state: 'active' } as any;

describe('CallProposalRolesSection', () => {
  it('describes each role: who may hold it, how many and whether it has a lead', () => {
    renderWithProviders(<CallProposalRolesSection call={call} />);
    expect(screen.getByText('Evaluator roles')).toBeInTheDocument();

    const lead = screen.getByTestId('row-lead');
    expect(lead).toHaveTextContent('Lead rapporteur');
    expect(lead).toHaveTextContent('Has a lead');
    expect(lead).toHaveTextContent('Panel members of the call');
    expect(lead).toHaveTextContent('Writes the consolidated report.');

    const external = screen.getByTestId('row-external');
    expect(external).toHaveTextContent('Any user');
    expect(external).toHaveTextContent('At least 2');
    expect(external).not.toHaveTextContent('Has a lead');
  });

  it('offers editing and removal, and only explains why on a read-only call', () => {
    dropdowns.value = [];
    renderWithProviders(<CallProposalRolesSection call={call} />);
    expect(dropdowns.value.every((props) => props.actions?.length === 2)).toBe(
      true,
    );

    dropdowns.value = [];
    renderWithProviders(
      <CallProposalRolesSection
        call={{ ...call, state: 'archived' }}
        isReadOnly
      />,
    );
    expect(dropdowns.value.length).toBeGreaterThan(0);
    for (const props of dropdowns.value) {
      expect(props.disabled).toBe(true);
      expect(props.tooltip).toBe('This call is archived and cannot be edited.');
    }
  });

  it('warns when the call cannot staff a role', () => {
    renderWithProviders(<CallProposalRolesSection call={call} />);
    expect(screen.getByTestId('row-lead')).toHaveTextContent(
      'The call has no panel members',
    );
    expect(screen.getByTestId('row-external')).not.toHaveTextContent(
      'The call has',
    );
  });
});

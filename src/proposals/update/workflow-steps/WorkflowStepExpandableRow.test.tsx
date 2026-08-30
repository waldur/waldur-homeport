import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { WorkflowStepExpandableRow } from './WorkflowStepExpandableRow';

const step = (overrides: Record<string, unknown>) =>
  ({
    uuid: 'step-1',
    step: 'panel_review',
    responsible_role: 'panel_member',
    transition_mode: 'automatic_on_completion',
    criteria: [],
    responsible_users: [],
    ...overrides,
  }) as any;

describe('WorkflowStepExpandableRow evaluators', () => {
  it('lists the people holding the responsible role and marks the chair', () => {
    renderWithProviders(
      <WorkflowStepExpandableRow
        row={step({
          responsible_users: [
            {
              uuid: 'u1',
              username: 'ada',
              full_name: 'Ada Lovelace',
              email: 'ada@example.org',
              is_panel_chair: true,
            },
            {
              uuid: 'u2',
              username: 'alan',
              full_name: 'Alan Turing',
              email: 'alan@example.org',
              is_panel_chair: false,
            },
          ],
        })}
      />,
    );
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada · ada@example.org')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getAllByText('Chair')).toHaveLength(1);
  });

  it('warns and links to the Team tab when nobody holds the role', () => {
    renderWithProviders(<WorkflowStepExpandableRow row={step({})} />);
    expect(screen.getByText('Nobody holds this role yet.')).toBeInTheDocument();
    expect(screen.getByText('Assign in the Team tab')).toBeInTheDocument();
  });

  it('explains the applicant role instead of listing users', () => {
    renderWithProviders(
      <WorkflowStepExpandableRow
        row={step({ step: 'award_response', responsible_role: 'applicant' })}
      />,
    );
    expect(
      screen.getByText('The applicant of each proposal'),
    ).toBeInTheDocument();
  });
});

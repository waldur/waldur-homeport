import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { DESCRIPTION } from '../description.fixture';

import { ProposalStepsChart } from './ProposalStepsGantt';
import { SwimlaneDiagram } from './SwimlaneDiagram';
import { WorkflowDiagramPanel } from './WorkflowDiagramPanel';
import { WorkflowGantt } from './WorkflowGantt';

describe('SwimlaneDiagram for assistive technology', () => {
  it('is a named group of buttons, each naming the step, stage and lane', () => {
    renderWithProviders(
      <SwimlaneDiagram description={DESCRIPTION} onOpenStep={vi.fn()} />,
    );
    // Not an image: an image's children are hidden from a screen reader.
    const diagram = screen.getByRole('group', { name: 'Workflow diagram' });
    const box = within(diagram).getByRole('button', {
      name: /^Technical assessment, Stage 1 · together, /,
    });
    expect(box).toHaveAttribute('tabindex', '0');
    expect(
      within(diagram).getByRole('button', {
        name: /^Consolidated report, Stage 2, /,
      }),
    ).toBeInTheDocument();
  });

  it('is an image when there is nothing to open', () => {
    renderWithProviders(<SwimlaneDiagram description={DESCRIPTION} />);
    expect(
      screen.getByRole('img', { name: 'Workflow diagram' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('WorkflowDiagramPanel', () => {
  it('scrolls from the keyboard and says the workflow in words', () => {
    renderWithProviders(
      <WorkflowDiagramPanel description={DESCRIPTION} name="call" />,
    );
    const region = screen.getByRole('region', { name: 'Workflow diagram' });
    expect(region).toHaveAttribute('tabindex', '0');

    const list = screen.getByRole('list', {
      name: 'Workflow steps and transitions',
    });
    // The drawing points at its text version.
    expect(
      screen.getByRole('img', { name: 'Workflow diagram' }),
    ).toHaveAttribute('aria-describedby', list.id);
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Technical assessment');
    expect(items[0]).toHaveTextContent('Then: Consolidated report.');
    expect(items[0]).toHaveTextContent(
      'Its outputs are read by: Consolidated report.',
    );

    // Hidden from sight, never from a screen reader.
    expect(list).toHaveClass('sr-only');
  });
});

describe('Timelines for assistive technology', () => {
  it('lists each bar with its days and length', () => {
    renderWithProviders(
      <WorkflowGantt
        plan={{
          name: null,
          cutoff: '2027-01-01',
          openEnded: false,
          decisionDay: 10,
          decisionSource: 'target_decision_days',
          totalDays: 15,
          overrunDays: 5,
          rows: [
            {
              key: 'a',
              name: 'Eligibility',
              start: 0,
              end: 8,
              conditional: false,
              critical: true,
              roundScoped: false,
              noDuration: false,
              late: false,
            },
            {
              key: 'b',
              name: 'Report',
              start: 8,
              end: 15,
              conditional: true,
              critical: false,
              roundScoped: false,
              noDuration: false,
              late: true,
            },
          ],
        }}
      />,
    );
    const chart = screen.getByRole('img', { name: 'Planned timeline' });
    const text = screen.getByTestId('workflow-gantt-text');
    expect(chart).toHaveAttribute('aria-describedby', text.id);
    const items = within(text).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent(
      /^Eligibility: day 0 to day 8, 8 days; .+ to .+; on the critical path$/,
    );
    expect(items[1]).toHaveTextContent('Report: day 8 to day 15, 7 days;');
    expect(items[1]).toHaveTextContent('if its condition holds');
    expect(items[1]).toHaveTextContent('ends after the decision is due');
    expect(items[2]).toHaveTextContent(/^Decision due, day 10/);
  });

  it("lists a proposal's steps with their dates against the plan", () => {
    renderWithProviders(
      <ProposalStepsChart
        timeline={{
          proposal_uuid: 'p',
          proposal_name: 'P',
          state: 'in_review',
          generated_at: '2027-01-20T00:00:00Z',
          steps: [
            {
              key: 'a',
              name: 'Eligibility',
              stage: 0,
              status: 'completed',
              outcome: 'eligible',
              planned_days: 5,
              started_at: '2027-01-01T00:00:00Z',
              completed_at: '2027-01-09T00:00:00Z',
              deadline: '2027-01-06T00:00:00Z',
              overdue: true,
              completed_by_name: 'Ada Lovelace',
              sent_notifications: [],
            },
          ],
          notifications: [],
        }}
      />,
    );
    const chart = screen.getByRole('img', {
      name: 'Steps planned against actual',
    });
    const text = screen.getByTestId('proposal-steps-gantt-text');
    expect(chart).toHaveAttribute('aria-describedby', text.id);
    expect(within(text).getByRole('listitem')).toHaveTextContent(
      /^Eligibility: .+; from .+ to .+, 8 days; planned 5 days; past its deadline; completed by Ada Lovelace$/,
    );
  });
});

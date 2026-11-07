import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { WorkflowSequencePreview } from './WorkflowSequencePreview';

describe('WorkflowSequencePreview', () => {
  it('stacks the steps of a parallel stage in one labelled column', () => {
    renderWithProviders(
      <WorkflowSequencePreview
        steps={[
          { uuid: 'a', name: 'Admin check', order: 0, is_enabled: true },
          {
            uuid: 'b',
            name: 'Technical assessment',
            order: 1,
            is_enabled: true,
          },
          {
            uuid: 'c',
            name: 'Innovation group',
            order: 2,
            is_enabled: true,
            parallel_with_previous: true,
          },
          { uuid: 'd', name: 'Decision', order: 3, is_enabled: true },
        ]}
      />,
    );
    const stage = screen.getByTestId('parallel-stage');
    // The stages are an ordered list; a parallel stage lists its steps.
    expect(
      within(
        screen.getByRole('region', { name: 'Step sequence' }),
      ).getAllByRole('listitem'),
    ).toHaveLength(5);
    const steps = within(stage).getByRole('list', {
      name: '2 steps that run in parallel',
    });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(2);
    expect(within(stage).getByText('Runs in parallel')).toBeInTheDocument();
    expect(within(stage).getByText('Technical assessment')).toBeInTheDocument();
    expect(within(stage).getByText('Innovation group')).toBeInTheDocument();
    expect(within(stage).queryByText('Decision')).not.toBeInTheDocument();
    expect(within(stage).queryByText('Admin check')).not.toBeInTheDocument();
    // One label for the stage, not one per step.
    expect(screen.getAllByText('Runs in parallel')).toHaveLength(1);
  });

  it('keeps what a step does behind its info button', async () => {
    renderWithProviders(
      <WorkflowSequencePreview
        steps={[{ uuid: 'a', name: 'Admin check', order: 0, is_enabled: true }]}
        describe={() => ({ description: 'Call managers check eligibility.' })}
      />,
    );
    expect(
      screen.queryByText('Call managers check eligibility.'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Admin check: step details' }),
    );
    expect(
      await screen.findByText('Call managers check eligibility.'),
    ).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChangeRequestNotice } from './ChangeRequestNotice';

const panel = {
  uuid: 'panel-request',
  step_uuid: 'panel-step',
  step_name: 'Panel review',
  message: 'Shorten the summary',
  unlocked_parts: ['field:project_summary'],
  due_at: '2026-11-20T10:00:00Z',
} as any;

const technical = {
  uuid: 'technical-request',
  step_uuid: 'technical-step',
  step_name: 'Technical assessment',
  message: 'Describe the GPU workload',
  unlocked_parts: ['resources', 'documents'],
  due_at: '2026-11-10T10:00:00Z',
} as any;

describe('ChangeRequestNotice', () => {
  it('names the step of a single request', () => {
    render(<ChangeRequestNotice changeRequests={[panel]} />);
    expect(
      screen.getByText('Changes requested at Panel review'),
    ).toBeInTheDocument();
    expect(screen.getByText('Shorten the summary')).toBeInTheDocument();
    expect(screen.getByText('You may edit: Summary.')).toBeInTheDocument();
  });

  it('lists every open request together, to submit at once', () => {
    render(<ChangeRequestNotice changeRequests={[panel, technical]} />);
    expect(
      screen.getByText('Changes requested at 2 steps'),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('change-request-notice-item')).toHaveLength(2);
    expect(screen.getByText('Panel review')).toBeInTheDocument();
    expect(screen.getByText('Technical assessment')).toBeInTheDocument();
    expect(screen.getByText('Describe the GPU workload')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You may edit: Resource requests, Supporting documentation.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Submit all the changes together, by .* at the latest/),
    ).toBeInTheDocument();
  });
});

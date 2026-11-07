import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SubmissionDeadlineField } from './SubmissionDeadlineField';

const row = (state: string) =>
  ({
    state,
    round: {
      cutoff_time: new Date(Date.now() + 10 * 86400000).toISOString(),
    },
  }) as any;

describe('SubmissionDeadlineField', () => {
  it('counts down to the cut-off for a draft', () => {
    render(<SubmissionDeadlineField row={row('draft')} />);
    expect(screen.getByText(/in (10|9) days/)).toBeInTheDocument();
  });

  it.each(['submitted', 'in_review', 'accepted', 'rejected'])(
    'shows no deadline once %s',
    (state) => {
      const { container } = render(
        <SubmissionDeadlineField row={row(state)} />,
      );
      expect(container.textContent).toBe('—');
    },
  );
});

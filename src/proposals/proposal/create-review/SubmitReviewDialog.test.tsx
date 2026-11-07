import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalReviewsPartialUpdate,
  proposalReviewsSubmit,
} from 'waldur-js-client';

import { ProposalReview } from '@/proposals/types';
import { renderWithProviders } from '@/test/harness';

import { SubmitReviewDialog } from './SubmitReviewDialog';

const EXCELLENCE = 'a'.repeat(32);
const IMPACT = 'b'.repeat(32);

const criterion = (uuid: string, name: string, order: number, weight = 1) => ({
  uuid,
  name,
  order,
  weight,
});

const makeReview = (overrides: Partial<ProposalReview> = {}) =>
  ({
    uuid: 'review-1',
    summary_score: 0,
    summary_public_comment: '',
    summary_private_comment: '',
    coi_confirmed: false,
    coi_confirmation_required: false,
    criteria: [],
    criteria_scores: {},
    ...overrides,
  }) as unknown as ProposalReview;

const render = (review: ProposalReview) =>
  renderWithProviders(<SubmitReviewDialog resolve={{ review }} />);

const rate = (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  stars: string,
) =>
  user.click(
    within(screen.getByRole('radiogroup', { name })).getByRole('radio', {
      name: stars,
    }),
  );

const submitButton = () =>
  screen.getByRole('button', { name: 'Submit review' });

describe('SubmitReviewDialog', () => {
  beforeEach(() => {
    vi.mocked(proposalReviewsPartialUpdate).mockResolvedValue({} as any);
    vi.mocked(proposalReviewsSubmit).mockResolvedValue({} as any);
  });

  it('rates a step without criteria with a single score', async () => {
    render(makeReview());
    const user = userEvent.setup();

    expect(
      screen.getByRole('radiogroup', { name: 'Rate' }),
    ).toBeInTheDocument();
    await rate(user, 'Rate', '4 stars');
    await user.click(screen.getByRole('button', { name: 'Save as draft' }));

    await waitFor(() =>
      expect(proposalReviewsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'review-1' },
        body: {
          summary_score: 4,
          summary_public_comment: '',
          summary_private_comment: '',
        },
      }),
    );
  });

  it('lists the criteria in order, with their saved scores', () => {
    render(
      makeReview({
        criteria: [
          criterion(IMPACT, 'Impact', 2),
          criterion(EXCELLENCE, 'Excellence', 1),
        ],
        criteria_scores: { [EXCELLENCE]: 3 },
      }),
    );

    expect(
      screen
        .getAllByRole('radiogroup')
        .map((group) => group.getAttribute('aria-label')),
    ).toEqual(['Excellence', 'Impact']);
    expect(
      within(screen.getByRole('radiogroup', { name: 'Excellence' })).getByRole(
        'radio',
        { name: '3 stars' },
      ),
    ).toBeChecked();
    expect(screen.queryByRole('radiogroup', { name: 'Rate' })).toBeNull();
  });

  it('holds the submission back until every criterion is rated', async () => {
    render(
      makeReview({
        criteria: [
          criterion(EXCELLENCE, 'Excellence', 1),
          criterion(IMPACT, 'Impact', 2),
        ],
      }),
    );
    const user = userEvent.setup();

    expect(submitButton()).toBeDisabled();
    expect(submitButton()).toHaveAccessibleDescription(
      'Rate every criterion to submit: Excellence, Impact.',
    );
    await rate(user, 'Excellence', '4 stars');
    expect(submitButton()).toHaveAccessibleDescription(
      'Rate every criterion to submit: Impact.',
    );
    await rate(user, 'Impact', '2 stars');
    expect(submitButton()).toBeEnabled();
  });

  it('shows the plain average while the criteria weigh the same', async () => {
    render(
      makeReview({
        criteria: [
          criterion(EXCELLENCE, 'Excellence', 1),
          criterion(IMPACT, 'Impact', 2),
        ],
      }),
    );
    const user = userEvent.setup();

    expect(
      screen.getByText('The overall score is the average of the criteria.'),
    ).toBeInTheDocument();
    await rate(user, 'Excellence', '5 stars');
    await rate(user, 'Impact', '2 stars');
    // 3.5 rounds half up.
    expect(screen.getByText('Overall score: 4 of 5')).toBeInTheDocument();
  });

  it('weighs the criteria by their weights and shows their shares', async () => {
    render(
      makeReview({
        criteria: [
          criterion(EXCELLENCE, 'Excellence', 1, 3),
          criterion(IMPACT, 'Impact', 2, 1),
        ],
      }),
    );
    const user = userEvent.setup();

    expect(
      screen.getByText(
        'The overall score is the weighted average of the criteria.',
      ),
    ).toBeInTheDocument();
    await rate(user, 'Excellence (75%)', '5 stars');
    await rate(user, 'Impact (25%)', '1 star');
    // (3 * 5 + 1 * 1) / 4
    expect(screen.getByText('Overall score: 4 of 5')).toBeInTheDocument();
  });

  it('saves the criteria scores, then submits the review', async () => {
    render(
      makeReview({
        criteria: [
          criterion(EXCELLENCE, 'Excellence', 1),
          criterion(IMPACT, 'Impact', 2),
        ],
        criteria_scores: { [EXCELLENCE]: 4 },
      }),
    );
    const user = userEvent.setup();

    await rate(user, 'Impact', '5 stars');
    await user.click(submitButton());

    await waitFor(() =>
      expect(proposalReviewsSubmit).toHaveBeenCalledWith({
        path: { uuid: 'review-1' },
        body: { coi_confirmed: false },
      }),
    );
    expect(proposalReviewsPartialUpdate).toHaveBeenCalledWith({
      path: { uuid: 'review-1' },
      body: {
        criteria_scores: { [EXCELLENCE]: 4, [IMPACT]: 5 },
        summary_public_comment: '',
        summary_private_comment: '',
      },
    });
    expect(
      vi.mocked(proposalReviewsPartialUpdate).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(proposalReviewsSubmit).mock.invocationCallOrder[0],
    );
  });

  it('asks for the conflict-of-interest confirmation when the call needs it', async () => {
    render(makeReview({ coi_confirmation_required: true, summary_score: 3 }));
    const user = userEvent.setup();

    expect(submitButton()).toBeDisabled();
    expect(submitButton()).toHaveAccessibleDescription(
      'Confirm absence of conflict of interest to submit.',
    );
    await user.click(
      screen.getByLabelText(
        'I confirm I have no conflict of interest with this proposal',
      ),
    );
    expect(submitButton()).toBeEnabled();
    await user.click(submitButton());

    await waitFor(() =>
      expect(proposalReviewsSubmit).toHaveBeenCalledWith({
        path: { uuid: 'review-1' },
        body: { coi_confirmed: true },
      }),
    );
  });
});

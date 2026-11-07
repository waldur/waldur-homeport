import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProposalReview } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { renderWithProviders } from '@/test/harness';

import {
  getRejectedOwnReview,
  RejectedReviewNotice,
} from './RejectedReviewNotice';

const REVIEWER = { uuid: 'reviewer-uuid' };
const MODIFIED = '2026-03-14T10:00:00Z';

const review = (overrides: Partial<ProposalReview> = {}) =>
  ({
    uuid: 'review-uuid',
    reviewer_uuid: REVIEWER.uuid,
    state: 'rejected',
    modified: MODIFIED,
    ...overrides,
  }) as ProposalReview;

describe('getRejectedOwnReview', () => {
  it('finds the reviewer’s own rejected review named in the link', () => {
    const own = review();
    expect(getRejectedOwnReview([own], 'review-uuid', REVIEWER)).toBe(own);
  });

  it('says nothing of a review still under way', () => {
    expect(
      getRejectedOwnReview(
        [review({ state: 'in_review' })],
        'review-uuid',
        REVIEWER,
      ),
    ).toBeNull();
  });

  it('says nothing of someone else’s rejected review', () => {
    expect(
      getRejectedOwnReview(
        [review({ reviewer_uuid: 'other' })],
        'review-uuid',
        REVIEWER,
      ),
    ).toBeNull();
  });

  it('needs the link to name a review', () => {
    expect(getRejectedOwnReview([review()], undefined, REVIEWER)).toBeNull();
    expect(getRejectedOwnReview([review()], 'missing', REVIEWER)).toBeNull();
  });
});

describe('RejectedReviewNotice', () => {
  const date = formatDate(MODIFIED);

  it('tells a reviewer who lost access why the proposal is gone', () => {
    renderWithProviders(
      <RejectedReviewNotice review={review()} hasAccess={false} />,
    );
    expect(
      screen.getByText(
        `This review was rejected on ${date}; you no longer have access to this proposal.`,
      ),
    ).toBeInTheDocument();
  });

  it('only notes the rejection when the proposal is still readable', () => {
    renderWithProviders(<RejectedReviewNotice review={review()} hasAccess />);
    expect(
      screen.getByText(`This review was rejected on ${date}.`),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no longer have access/)).not.toBeInTheDocument();
  });
});

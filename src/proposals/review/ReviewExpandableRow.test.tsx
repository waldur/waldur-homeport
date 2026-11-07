import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ReviewDetails } from './ReviewExpandableRow';

const review = {
  uuid: 'review-1',
  summary_score: 4,
  summary_public_comment: 'Sound methodology.',
} as any;

describe('ReviewDetails', () => {
  it('shows the private comment to whom the API returns it', () => {
    renderWithProviders(
      <ReviewDetails
        review={{ ...review, summary_private_comment: 'For the panel.' }}
      />,
    );

    expect(screen.getByText(/Private comment/)).toBeInTheDocument();
    expect(screen.getByText('For the panel.')).toBeInTheDocument();
  });

  it('leaves the row out for the applicant, who never gets it', () => {
    renderWithProviders(<ReviewDetails review={review} />);

    expect(screen.getByText('Sound methodology.')).toBeInTheDocument();
    expect(screen.queryByText(/Private comment/)).not.toBeInTheDocument();
  });

  it('lists each criterion with its score', () => {
    renderWithProviders(
      <ReviewDetails
        review={{
          ...review,
          criteria: [
            { uuid: 'b', name: 'Impact', order: 2, weight: 1 },
            { uuid: 'a', name: 'Excellence', order: 1, weight: 1 },
          ],
          criteria_scores: { a: 5 },
        }}
      />,
    );

    const excellence = screen.getByText(/^Excellence/);
    const impact = screen.getByText(/^Impact/);
    expect(
      excellence.compareDocumentPosition(impact) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText('(5/5)')).toBeInTheDocument();
    expect(screen.queryByText(/%\)/)).not.toBeInTheDocument();
  });

  it("names a criterion's share when the criteria weigh differently", () => {
    renderWithProviders(
      <ReviewDetails
        review={{
          ...review,
          criteria: [
            { uuid: 'a', name: 'Excellence', order: 1, weight: 3 },
            { uuid: 'b', name: 'Impact', order: 2, weight: 1 },
          ],
          criteria_scores: { a: 5, b: 2 },
        }}
      />,
    );

    expect(screen.getByText(/Excellence \(75%\)/)).toBeInTheDocument();
    expect(screen.getByText(/Impact \(25%\)/)).toBeInTheDocument();
  });
});

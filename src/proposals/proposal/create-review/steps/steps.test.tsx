import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { proposalProposalsChecklistRetrieve } from 'waldur-js-client';

import { proposalHasCompliance } from '@/proposals/proposal/create/complianceUtils';
import { renderWithProviders } from '@/test/harness';

import { ReviewComplianceStep } from './ReviewComplianceStep';
import { createReviewSteps } from './steps';

describe('createReviewSteps', () => {
  it('has no compliance section when the proposal has no checklist', () => {
    expect(createReviewSteps(false).map((step) => step.id)).toEqual([
      'step-general',
      'step-project',
      'step-resource-requests',
      'step-team',
    ]);
  });

  it('adds the compliance section after project details', () => {
    expect(createReviewSteps(true).map((step) => step.id)).toEqual([
      'step-general',
      'step-project',
      'step-compliance',
      'step-resource-requests',
      'step-team',
    ]);
  });
});

describe('proposalHasCompliance', () => {
  it('is false for a proposal submitted without a checklist', () => {
    expect(proposalHasCompliance({ compliance_status: null })).toBe(false);
    expect(proposalHasCompliance(undefined)).toBe(false);
  });

  it('is true once the proposal carries a compliance status', () => {
    expect(
      proposalHasCompliance({ compliance_status: { is_completed: true } }),
    ).toBe(true);
  });
});

describe('ReviewComplianceStep', () => {
  const proposal = { uuid: 'proposal-1', compliance_status: {} } as any;
  const renderStep = () =>
    renderWithProviders(
      <ReviewComplianceStep
        {...({ id: 'step-compliance', params: { proposal } } as any)}
      />,
    );

  it('shows the applicant answers to a reviewer who may read them', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockResolvedValue({
      data: {
        questions: [
          {
            uuid: 'q-1',
            description: 'Does the project handle personal data?',
            question_type: 'boolean',
            existing_answer: { answer_data: false },
          },
        ],
      },
    } as any);

    renderStep();

    expect(
      await screen.findByText('Does the project handle personal data?'),
    ).toBeInTheDocument();
  });

  it('hides itself when the backend denies access', async () => {
    vi.mocked(proposalProposalsChecklistRetrieve).mockRejectedValue({
      response: { status: 403, data: { detail: 'Not allowed.' } },
    });

    const { container } = renderStep();

    // Nothing at all; the page leaves it out of its navigation too.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

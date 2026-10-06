import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsStepChecklistResponsesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { TechnicalAssessmentSection } from './TechnicalAssessmentSection';

const proposal = { uuid: 'proposal-1', call_uuid: 'call-1' } as any;

describe('TechnicalAssessmentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsStepChecklistResponsesList).mockResolvedValue({
      data: [
        {
          user_uuid: 'reviewer-1',
          user_full_name: 'Tess Technical',
          user_image: null,
          submitted_at: '2026-09-01T10:00:00Z',
          answers: [],
        },
      ],
    } as any);
  });

  it('does not ask for the assessments on behalf of a viewer who may not read them', async () => {
    const { container } = renderWithProviders(
      <TechnicalAssessmentSection proposal={proposal} enabled={false} />,
    );
    // Give a stray query the chance to fire before asserting it did not.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(proposalProposalsStepChecklistResponsesList).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows every technical reviewer to a viewer who may read them', async () => {
    renderWithProviders(
      <TechnicalAssessmentSection proposal={proposal} enabled />,
    );
    expect(await screen.findByText('Tess Technical')).toBeInTheDocument();
    await waitFor(() =>
      expect(proposalProposalsStepChecklistResponsesList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { step: 'technical_assessment' },
        }),
      ),
    );
  });
});

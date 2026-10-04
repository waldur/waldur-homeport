import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ProposalSidebar } from './ProposalSidebar';

vi.mock('@/form/FloatingSubmitButton', () => ({
  FloatingSubmitButton: ({ label }) => <button type="submit">{label}</button>,
}));
vi.mock('@/form/TosNotification', () => ({ TosNotification: () => null }));
vi.mock('@/wizard', () => ({ FormSteps: () => null }));
vi.mock('@/proposals/ProposalCostTotal', () => ({
  ProposalCostTotal: () => null,
}));

const renderSidebar = (canSubmitProposal?: boolean) =>
  renderWithProviders(
    <ProposalSidebar
      steps={[]}
      completedSteps={[]}
      saveAsDraft={vi.fn()}
      editable
      canSubmitProposal={canSubmitProposal}
    />,
  );

describe('ProposalSidebar', () => {
  it('offers Submit to whoever may submit the proposal', () => {
    renderSidebar(true);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('leaves submitting to a manager for a proposal administrator', () => {
    renderSidebar(false);
    expect(
      screen.queryByRole('button', { name: 'Submit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Only a proposal manager can submit the proposal.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save as draft' }),
    ).toBeInTheDocument();
  });
});

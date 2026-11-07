import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';
import { renderWithProviders } from '@/test/harness';

import { SectionOpenProvider } from '../proposal/sectionOpen';

import { getCategoryEventTypes } from './categories';
import {
  PROPOSAL_ACTIVITY_SECTION_ID,
  ProposalActivitySection,
} from './ProposalActivitySection';

const { listProps } = vi.hoisted(() => ({ listProps: { value: null as any } }));

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: vi.fn(() => true),
}));

vi.mock('@/events/BaseEventsList', () => ({
  BaseEventsList: (props) => {
    listProps.value = props;
    return null;
  },
}));

const proposal = {
  uuid: 'proposal-1',
  url: 'http://example.com/api/proposal-proposals/proposal-1/',
} as Proposal;

const renderSection = (open: boolean) =>
  renderWithProviders(
    <SectionOpenProvider value={{ isOpen: () => open, setOpen: vi.fn() }}>
      <ProposalActivitySection proposal={proposal} />
    </SectionOpenProvider>,
  );

describe('ProposalActivitySection', () => {
  afterEach(() => {
    listProps.value = null;
  });

  // The applicant reads this feed; a marketplace-only deployment never calls
  // their request a proposal.
  it('names the access request where calls are hidden', () => {
    vi.mocked(usesCallVocabulary).mockReturnValueOnce(false);
    renderSection(false);
    expect(
      screen.getByText(/What happened on this access request/),
    ).toBeInTheDocument();
  });

  // Each tab carries a hint saying what it lists, in the deployment's own
  // words.
  const hintOf = async (tab: string, text: RegExp) => {
    await userEvent.hover(screen.getByRole('tab', { name: tab }));
    await waitFor(() =>
      expect(screen.getAllByText(text).length).toBeGreaterThan(0),
    );
  };

  it('explains each tab, in request wording where calls are hidden', async () => {
    vi.mocked(usesCallVocabulary).mockReturnValue(false);
    renderSection(true);
    await hintOf('Workflow', /How the request moved through approval/);
    await userEvent.unhover(screen.getByRole('tab', { name: 'Workflow' }));
    await hintOf('Reports', /assessments submitted, feedback released to you/);
    vi.mocked(usesCallVocabulary).mockReturnValue(true);
  });

  it('explains each tab in proposal wording', async () => {
    renderSection(true);
    await hintOf('Workflow', /How the proposal moved through its evaluation/);
  });

  it('starts folded and fetches nothing', () => {
    renderSection(false);
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(listProps.value).toBeNull();
  });

  it("lists every event of the proposal's feed the viewer reads", () => {
    renderSection(true);
    expect(listProps.value.filter).toEqual({
      scope: proposal.url,
      event_type: undefined,
    });
  });

  it('narrows the list to a category', async () => {
    renderSection(true);
    await userEvent.click(screen.getByText('Team'));
    expect(listProps.value.filter.event_type).toEqual(
      getCategoryEventTypes('team'),
    );
    expect(listProps.value.filter.event_type).toContain('role_granted');
  });

  it('is listed in the rail under its own id', () => {
    expect(PROPOSAL_ACTIVITY_SECTION_ID).toBe('step-activity');
  });
});

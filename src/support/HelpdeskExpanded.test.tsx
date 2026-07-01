import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportIssuesRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { HelpdeskExpanded } from './HelpdeskExpanded';

// The left pane reuses the full IssuesList table; here we stub it down to a
// single clickable row so the test exercises HelpdeskExpanded's selection
// wiring (onIssueSelect -> right-pane fetch) rather than table internals.
vi.mock('@/issues/list/IssuesList', () => ({
  IssuesList: (props: any) => (
    <button
      type="button"
      data-testid="issue-row"
      data-selected={props.selectedIssueUuid === 'issue-1'}
      onClick={() => props.onIssueSelect({ uuid: 'issue-1' })}
    >
      WAL-1
    </button>
  ),
}));

// Stub the detail body to avoid pulling in the comments/attachments subtrees
// and the WALDUR_SUPPORT config shape; HelpdeskExpanded only needs to render
// it with the fetched issue. The SDK is auto-mocked globally (test/mocks).
vi.mock('@/issues/IssueDetailsContent', () => ({
  IssueDetailsContent: ({ issue }: { issue: any }) => (
    <div data-testid="issue-detail">{issue.summary}</div>
  ),
}));

describe('HelpdeskExpanded', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the requests table', () => {
    renderWithProviders(<HelpdeskExpanded />);
    expect(screen.getByTestId('issue-row')).toBeInTheDocument();
  });

  it('shows the empty state when no request is selected', () => {
    renderWithProviders(<HelpdeskExpanded />);
    expect(screen.getByText('No request selected')).toBeInTheDocument();
    expect(screen.queryByTestId('issue-detail')).not.toBeInTheDocument();
  });

  it('selecting a row loads and shows that request in the detail pane', async () => {
    vi.mocked(supportIssuesRetrieve).mockResolvedValue({
      data: { uuid: 'issue-1', summary: 'Broken VM' },
    } as any);

    const user = userEvent.setup();
    renderWithProviders(<HelpdeskExpanded />);

    expect(screen.getByText('No request selected')).toBeInTheDocument();

    await user.click(screen.getByTestId('issue-row'));

    expect(await screen.findByTestId('issue-detail')).toHaveTextContent(
      'Broken VM',
    );
    expect(supportIssuesRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'issue-1' },
    });
    expect(screen.queryByText('No request selected')).not.toBeInTheDocument();
  });

  it('passes the selected uuid back to the list for highlighting', async () => {
    vi.mocked(supportIssuesRetrieve).mockResolvedValue({
      data: { uuid: 'issue-1', summary: 'Broken VM' },
    } as any);

    const user = userEvent.setup();
    renderWithProviders(<HelpdeskExpanded />);

    await user.click(screen.getByTestId('issue-row'));

    await waitFor(() =>
      expect(screen.getByTestId('issue-row')).toHaveAttribute(
        'data-selected',
        'true',
      ),
    );
  });
});

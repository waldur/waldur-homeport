import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { MyReviewerSuggestionsSection } from './MyReviewerSuggestionsSection';
import { SuggestedReviewersSection } from './SuggestedReviewersSection';

const { state } = vi.hoisted(() => ({
  state: { all: {} as any, mine: {} as any },
}));

vi.mock('./queries', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./queries')>()),
  useSuggestedReviewers: () => state.all,
  useMyReviewerSuggestions: () => state.mine,
}));

// The rows are those the section holds, each cell rendered.
vi.mock('@/table/useTable', () => ({
  useTable: () => ({
    fetch: vi.fn(),
    resetSelection: vi.fn(),
    rows: state.all.data ?? [],
  }),
}));

vi.mock('@/table/Table', () => ({
  default: ({ verboseName, rows, columns }) => (
    <div data-testid="table">
      {verboseName}
      {(rows ?? []).map((row, index) => (
        <div key={index}>
          {columns.map((column, i) => (
            <span key={i}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const proposal = { uuid: 'proposal-uuid', call_uuid: 'call-uuid' } as any;
const loaded = { data: [], isError: false, error: null, dataUpdatedAt: 1 };

describe('SuggestedReviewersSection', () => {
  beforeEach(() => {
    state.all = loaded;
  });

  it('lists the suggestions for a reader', () => {
    renderWithProviders(
      <SuggestedReviewersSection proposal={proposal} canInvite={false} />,
    );
    expect(
      screen.getByText('Reviewers suggested by the evaluators'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('stays silent when the viewer is refused', () => {
    state.all = {
      ...loaded,
      data: undefined,
      isError: true,
      error: { status: 403 },
    };
    const { container } = renderWithProviders(
      <SuggestedReviewersSection proposal={proposal} canInvite />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('reports any other failure instead of hiding the section', () => {
    state.all = {
      ...loaded,
      data: undefined,
      isError: true,
      error: { response: { status: 500 } },
    };
    renderWithProviders(
      <SuggestedReviewersSection proposal={proposal} canInvite />,
    );
    expect(
      screen.getByText('Unable to load the suggested reviewers.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('table')).not.toBeInTheDocument();
  });
});

describe('SuggestedReviewersSection rows', () => {
  it('says a declined reviewer is not invited again', () => {
    state.all = {
      ...loaded,
      data: [
        {
          key: 'email:declined@example.org',
          email: 'declined@example.org',
          status: 'declined',
          suggestions: [],
          suggestion_uuids: ['s-1'],
          conflicts: [],
          has_conflict: false,
          is_applicant_excluded: false,
          holds_evaluator_role: false,
          is_on_applicant_team: false,
          already_in_pool: true,
        },
      ],
    };
    renderWithProviders(
      <SuggestedReviewersSection proposal={proposal} canInvite />,
    );
    expect(screen.getByText('Declined')).toBeInTheDocument();
    expect(
      screen.getByText('Declined the invitation; not invited again.'),
    ).toBeInTheDocument();
  });
});

describe('SuggestedReviewersSection for the step completer', () => {
  const row = (values: Record<string, unknown>) => ({
    status: 'pending',
    suggestions: [],
    suggestion_uuids: ['s-1'],
    conflicts: [],
    has_conflict: false,
    is_applicant_excluded: false,
    holds_evaluator_role: false,
    is_on_applicant_team: false,
    already_in_pool: false,
    ...values,
  });

  it('names a picked user without an address, and a typed address apart', () => {
    state.all = {
      ...loaded,
      data: [
        row({
          key: 'user:ada',
          suggested_user_uuid: 'ada',
          suggested_user_name: 'Ada Lovelace',
          email: '',
        }),
        row({
          key: 'email:ada@example.org',
          suggested_user_uuid: null,
          suggested_user_name: null,
          email: 'ada@example.org',
        }),
      ],
    };
    renderWithProviders(
      <SuggestedReviewersSection proposal={proposal} canInvite={false} />,
    );
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    // The typed address names its own row, once; nothing links to an address.
    expect(screen.getAllByText('ada@example.org')).toHaveLength(1);
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Already in the pool')).not.toBeInTheDocument();
  });
});

describe('MyReviewerSuggestionsSection', () => {
  beforeEach(() => {
    state.mine = loaded;
  });

  it('offers to suggest only to a holder of the contributor role', () => {
    renderWithProviders(
      <MyReviewerSuggestionsSection proposal={proposal} canSuggest />,
    );
    expect(screen.getByText('Suggest a reviewer')).toBeInTheDocument();

    const { container } = renderWithProviders(
      <MyReviewerSuggestionsSection proposal={proposal} canSuggest={false} />,
    );
    // Nothing suggested and nothing to suggest: no section.
    expect(container).toBeEmptyDOMElement();
  });

  it('reports a failure rather than an empty list', () => {
    state.mine = {
      ...loaded,
      data: undefined,
      isError: true,
      error: { status: 500 },
    };
    renderWithProviders(
      <MyReviewerSuggestionsSection proposal={proposal} canSuggest />,
    );
    expect(
      screen.getByText('Unable to load the reviewers you suggested.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('table')).not.toBeInTheDocument();
  });
});

describe('suggestion panels', () => {
  beforeEach(() => {
    state.all = loaded;
    state.mine = loaded;
  });

  // Open to begin with, and folded by the reader like every other card.
  it.each([
    [
      'Reviewers suggested by the evaluators',
      () => <SuggestedReviewersSection proposal={proposal} canInvite />,
    ],
    [
      'Suggested reviewers',
      () => <MyReviewerSuggestionsSection proposal={proposal} canSuggest />,
    ],
  ])('folds "%s" when its header is clicked', async (title, Panel) => {
    renderWithProviders(<Panel />);
    const header = screen.getByRole('button', {
      name: new RegExp(`^${title}`),
    });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});

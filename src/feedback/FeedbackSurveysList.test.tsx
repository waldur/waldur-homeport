import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { FeedbackSurveysList } from './FeedbackSurveysList';

const survey = { uuid: 'survey-uuid', name: 'Quarterly pulse' };

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [survey] }),
}));

// Render the table actions and each row's actions inline.
vi.mock('@/table/Table', () => ({
  default: ({ rows, tableActions, rowActions: RowActions }) => (
    <>
      {tableActions}
      {rows.map((row) => (
        <RowActions key={row.uuid} row={row} />
      ))}
    </>
  ),
}));

vi.mock('@/table/ActionsDropdown', () => ({
  ActionsDropdown: ({ actions, row }) =>
    actions.map((Action, index) => <Action key={index} row={row} />),
}));

vi.mock('./FeedbackSurveyButtons', () => ({
  FeedbackSurveyCreateButton: () => <span>Create survey</span>,
  FeedbackSurveyEditButton: () => <span>Edit survey</span>,
  FeedbackSurveyDeleteAction: () => <span>Remove survey</span>,
  FeedbackSurveyResultsAction: () => <span>View results</span>,
}));

const renderAs = (user) =>
  render(
    <Provider store={configureStore()({ workspace: { user } })}>
      <FeedbackSurveysList />
    </Provider>,
  );

describe('FeedbackSurveysList', () => {
  it('lets a support user create and edit surveys', () => {
    renderAs({ is_staff: false, is_support: true });

    expect(screen.getByText('Create survey')).toBeInTheDocument();
    expect(screen.getByText('Edit survey')).toBeInTheDocument();
  });

  it('offers only the results to a user who is neither staff nor support', () => {
    renderAs({ is_staff: false, is_support: false });

    expect(screen.queryByText('Create survey')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit survey')).not.toBeInTheDocument();
    expect(screen.getByText('View results')).toBeInTheDocument();
  });
});

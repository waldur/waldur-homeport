import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { describe, it, expect, vi } from 'vitest';
import { QuestionAdmin } from 'waldur-js-client';

import { FieldsListGroup } from './QuestionVisibilityForm';

const mockQuestions = [
  {
    url: '/api/marketplace-checklists-questions/1/',
    uuid: 'uuid1',
    description: 'First boolean question',
    question_type: 'boolean',
  },
  {
    url: '/api/marketplace-checklists-questions/2/',
    uuid: 'uuid2',
    description: 'Second select question',
    question_type: 'single_select',
    question_options: [
      { uuid: 'opt1', name: 'Option A' },
      { uuid: 'opt2', name: 'Option B' },
    ],
  },
  {
    url: '/api/marketplace-checklists-questions/3/',
    uuid: 'uuid3',
    description: 'Third text question',
    question_type: 'text_input',
  },
] as unknown as QuestionAdmin[];

const renderComponent = (initialValues = {}) => {
  return render(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FieldArray
            name="conditions"
            component={FieldsListGroup}
            questions={mockQuestions}
          />
        </form>
      )}
    />,
  );
};

describe('FieldsListGroup', () => {
  it('renders initial empty state correctly', () => {
    renderComponent();

    // Add condition button should be enabled
    expect(
      screen.getByRole('button', { name: /Add condition/i }),
    ).toBeEnabled();

    // Radio buttons for dependency logic should be disabled since fields < 2
    expect(screen.getByLabelText(/All conditions match/i)).toBeDisabled();
    expect(screen.getByLabelText(/Any condition matches/i)).toBeDisabled();
  });

  it('can add a new condition row', async () => {
    renderComponent();

    const addButton = screen.getByRole('button', { name: /Add condition/i });
    await userEvent.click(addButton);

    // Condition 1 card should appear
    expect(screen.getByText('Condition 1')).toBeInTheDocument();

    // "Depends on question" select should be present
    expect(screen.getByText('Depends on question')).toBeInTheDocument();

    // Condition dropdown should be disabled
    const conditionSelect = screen.getByLabelText('Condition');
    expect(conditionSelect).toBeDisabled();

    // Add button should now be disabled because row is incomplete
    expect(
      screen.getByRole('button', { name: /Add condition/i }),
    ).toBeDisabled();
  });

  it('enables condition and value fields upon selecting a question', async () => {
    renderComponent({ conditions: [{}] });

    // Open questions select
    const questionSelectInput = screen.getByLabelText(/Depends on question/i);
    await userEvent.click(questionSelectInput);

    // Select the boolean question
    const firstQuestionOption = await screen.findByText(
      'First boolean question',
    );
    await userEvent.click(firstQuestionOption);

    // The condition select should now be enabled
    const conditionSelect = screen.getByLabelText('Condition');
    expect(conditionSelect).toBeEnabled();

    // Open condition select and pick 'Exact match'
    await userEvent.click(conditionSelect);
    const equalToOption = await screen.findByText('Exact match');
    await userEvent.click(equalToOption);

    // Now the value field should be enabled
    // Since it's boolean, it renders an AwesomeCheckboxGroup which renders a checkbox
    const valueCheckbox = screen.getByLabelText(/Value/i);
    expect(valueCheckbox).toBeEnabled();
    expect(valueCheckbox.tagName).toBe('INPUT');
    expect(valueCheckbox).toHaveAttribute('type', 'checkbox');

    // Add button should now be enabled again
    expect(
      screen.getByRole('button', { name: /Add condition/i }),
    ).toBeEnabled();
  });

  it('filters out already selected questions from options in subsequent rows', async () => {
    renderComponent({
      conditions: [
        {
          depends_on_question: '/api/marketplace-checklists-questions/1/',
          operator: 'eq',
          required_answer_value: true,
        },
      ],
    });

    const addButton = screen.getByRole('button', { name: /Add condition/i });
    await userEvent.click(addButton);

    // There should be 2 condition cards
    expect(screen.getByText('Condition 1')).toBeInTheDocument();
    expect(screen.getByText('Condition 2')).toBeInTheDocument();

    // Find the Depends on question input for the second row
    const selects = screen.getAllByLabelText(/Depends on question/i);
    const secondSelect = selects[1];

    await userEvent.click(secondSelect);

    // Option 1 should NOT be present, but Option 2 and 3 should be
    expect(
      screen.queryByRole('option', { name: 'First boolean question' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Second select question' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Third text question' }),
    ).toBeInTheDocument();
  });

  it('disables dependency logic radio if < 2 rows, enables if >= 2 rows', () => {
    const { rerender } = render(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ conditions: [{}] }}
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <FieldArray
              name="conditions"
              component={FieldsListGroup}
              questions={mockQuestions}
            />
          </form>
        )}
      />,
    );

    expect(screen.getByLabelText(/All conditions match/i)).toBeDisabled();

    // Provide 2 valid rows
    rerender(
      <Form
        onSubmit={vi.fn()}
        initialValues={{
          conditions: [
            {
              depends_on_question: '/api/marketplace-checklists-questions/1/',
              operator: 'eq',
              required_answer_value: true,
            },
            {
              depends_on_question: '/api/marketplace-checklists-questions/2/',
              operator: 'eq',
              required_answer_value: 'opt1',
            },
          ],
        }}
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <FieldArray
              name="conditions"
              component={FieldsListGroup}
              questions={mockQuestions}
            />
          </form>
        )}
      />,
    );

    expect(screen.getByLabelText(/All conditions match/i)).toBeEnabled();
    expect(screen.getByLabelText(/Any condition matches/i)).toBeEnabled();
  });

  it('prevents adding rows beyond the available number of questions', () => {
    renderComponent({
      conditions: [
        {
          depends_on_question: '/api/marketplace-checklists-questions/1/',
          operator: 'eq',
          required_answer_value: true,
        },
        {
          depends_on_question: '/api/marketplace-checklists-questions/2/',
          operator: 'eq',
          required_answer_value: 'opt1',
        },
        {
          depends_on_question: '/api/marketplace-checklists-questions/3/',
          operator: 'eq',
          required_answer_value: 'test',
        },
      ],
    });

    // Max 3 questions exist, so addButton should be disabled
    expect(
      screen.getByRole('button', { name: /Add condition/i }),
    ).toBeDisabled();
  });

  it('allows removing a condition', async () => {
    renderComponent({
      conditions: [
        {
          depends_on_question: '/api/marketplace-checklists-questions/1/',
          operator: 'eq',
          required_answer_value: true,
        },
      ],
    });

    expect(screen.getByText('Condition 1')).toBeInTheDocument();

    const trashIcon = screen.getByTestId('TrashIcon');
    expect(trashIcon).toBeInTheDocument();

    await userEvent.click(trashIcon);

    expect(screen.queryByText('Condition 1')).not.toBeInTheDocument();
  });
});

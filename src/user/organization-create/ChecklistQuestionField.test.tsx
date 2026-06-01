import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ChecklistQuestionField } from './ChecklistQuestionField';

vi.mock('@/marketplace-checklist/utils', () => ({
  useQuestionNumberValidator: vi.fn(),
}));

const renderField = (
  question: any,
  allQuestions: any[] = [],
  formValues: any = {},
) =>
  render(
    <Form
      onSubmit={() => {}}
      render={() => (
        <ChecklistQuestionField
          question={question}
          allQuestions={allQuestions}
          formValues={formValues}
        />
      )}
    />,
  );

describe('ChecklistQuestionField', () => {
  it('renders BooleanGroup for boolean type', () => {
    const question = {
      uuid: 'q1',
      question_type: 'boolean',
      description: 'Is this true?',
      user_guidance: 'Helpful info',
      required: true,
    };
    renderField(question);
    expect(screen.getByLabelText(/Is this true\?/)).toBeDefined();
    expect(screen.getByText('Helpful info')).toBeDefined();
  });

  it('renders EmailGroup for email type', () => {
    const question = {
      uuid: 'q2',
      question_type: 'email',
      description: 'Email address',
      user_guidance: 'your@email.com',
    };
    renderField(question);
    expect(screen.getByLabelText(/Email address/)).toBeDefined();
    expect(screen.getByPlaceholderText('your@email.com')).toBeDefined();
  });

  it('renders DateTimeGroup for datetime type', () => {
    const question = {
      uuid: 'q3',
      question_type: 'datetime',
      description: 'Date and Time',
    };
    renderField(question);
    expect(screen.getByText('Date and Time')).toBeDefined();
  });

  it('renders PhoneNumberGroup for phone_number type', () => {
    const question = {
      uuid: 'q4',
      question_type: 'phone_number',
      description: 'Phone',
      user_guidance: '+123',
    };
    renderField(question);
    expect(screen.getByText('Phone')).toBeDefined();
    expect(screen.getByPlaceholderText('+123')).toBeDefined();
  });

  it('renders YearGroup for year type', () => {
    const question = {
      uuid: 'q5',
      question_type: 'year',
      description: 'Year',
    };
    renderField(question);
    expect(screen.getByText('Year')).toBeDefined();
  });

  it('handles visibility based on dependencies', () => {
    const allQuestions = [
      { uuid: 'q1', description: 'Parent', question_type: 'text_input' },
      {
        uuid: 'q2',
        description: 'Child',
        question_type: 'text_input',
        dependencies_info: {
          logic: 'and',
          conditions: [
            {
              question_description: 'Parent',
              operator: 'equals',
              required_value: 'yes',
            },
          ],
        },
      },
    ];

    // Hidden when condition not met
    const { rerender } = render(
      <Form
        onSubmit={() => {}}
        initialValues={{ question_q1: 'no' }}
        render={({ values }) => (
          <ChecklistQuestionField
            question={allQuestions[1] as any}
            allQuestions={allQuestions as any}
            formValues={values}
          />
        )}
      />,
    );
    expect(screen.queryByText('Child')).toBeNull();

    // Visible when condition met
    rerender(
      <Form
        onSubmit={() => {}}
        initialValues={{ question_q1: 'yes' }}
        render={({ values }) => (
          <ChecklistQuestionField
            question={allQuestions[1] as any}
            allQuestions={allQuestions as any}
            formValues={values}
          />
        )}
      />,
    );
    expect(screen.getByText('Child')).toBeDefined();
  });
});

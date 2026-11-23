import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { QuestionGeneralForm } from './QuestionGeneralForm';

const renderForm = (initialValues) =>
  renderWithProviders(
    <Form
      onSubmit={() => undefined}
      initialValues={initialValues}
      render={({ values }) => (
        <QuestionGeneralForm values={values as any} local />
      )}
    />,
  );

describe('QuestionGeneralForm range bounds', () => {
  it('refuses a maximum below the minimum', async () => {
    const user = userEvent.setup();
    renderForm({ description: 'Year', question_type: 'year', min_value: 5 });
    const max = screen.getByLabelText(/Max value/i);
    await user.type(max, '0');
    await user.tab();
    expect(
      await screen.findByText(
        'Maximum value cannot be less than the minimum value.',
      ),
    ).toBeInTheDocument();
  });

  it('accepts equal bounds', async () => {
    const user = userEvent.setup();
    renderForm({ description: 'Year', question_type: 'year', min_value: 5 });
    await user.type(screen.getByLabelText(/Max value/i), '5');
    await user.tab();
    expect(
      screen.queryByText(
        'Maximum value cannot be less than the minimum value.',
      ),
    ).not.toBeInTheDocument();
  });
});

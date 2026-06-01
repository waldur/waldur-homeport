import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { ArticleCodeField } from './ArticleCodeField';

const renderComponent = (initialValues = {}) => {
  return render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ArticleCodeField />
        </form>
      )}
    />,
  );
};

describe('ArticleCodeField', () => {
  it('renders article code field with correct label', () => {
    renderComponent();

    expect(screen.getByText('Article code')).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    const initialValues = {
      article_code: 'TEST123',
    };

    renderComponent(initialValues);

    expect(screen.getByDisplayValue('TEST123')).toBeInTheDocument();
  });

  it('allows entering article code', async () => {
    renderComponent();
    const user = userEvent.setup();

    const input = screen.getByLabelText(/Article code/i);
    await user.type(input, 'ABC123');

    expect(input).toHaveValue('ABC123');
  });

  it('shows validation error when article code is invalid', async () => {
    renderComponent();
    const user = userEvent.setup();

    const input = screen.getByLabelText(/Article code/i);
    // Type a short article code to trigger validation error
    await user.type(input, 'A');

    // Blur the field to trigger validation
    await user.tab();

    expect(screen.getByText('Code is too short.')).toBeInTheDocument();
  });

  it('does not show error for valid article code', async () => {
    renderComponent();
    const user = userEvent.setup();

    const input = screen.getByLabelText(/Article code/i);
    await user.type(input, 'VALID123');

    // Blur the field to trigger validation
    await user.tab();

    expect(screen.queryByText('Code is too short.')).not.toBeInTheDocument();
  });

  it('handles empty article code', async () => {
    const initialValues = {
      article_code: 'TEST',
    };

    renderComponent(initialValues);
    const user = userEvent.setup();

    const input = screen.getByDisplayValue('TEST');
    await user.clear(input);

    expect(input).toHaveValue('');

    // Blur to trigger validation
    await user.tab();

    // Should not show validation error for empty value (field is optional)
    expect(screen.queryByText('Code is too short.')).not.toBeInTheDocument();
  });
});

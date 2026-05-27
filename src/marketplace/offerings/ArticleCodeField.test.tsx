import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ArticleCodeField } from './ArticleCodeField';

// Mock dependencies

vi.mock('./utils', () => ({
  articleCodeValidator: vi.fn((value) => {
    if (value && value.length > 10) {
      return 'Article code is too long';
    }
    return undefined;
  }),
}));

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

    // Find input by name attribute
    const input = screen.getByRole('textbox');
    await user.type(input, 'ABC123');

    expect(input).toHaveValue('ABC123');
  });

  it('shows validation error when article code is invalid', async () => {
    renderComponent();
    const user = userEvent.setup();

    const input = screen.getByRole('textbox');
    // Type a long article code to trigger validation error
    await user.type(input, 'VERY_LONG_ARTICLE_CODE');

    // Blur the field to trigger validation
    await user.tab();

    expect(screen.getByText('Article code is too long')).toBeInTheDocument();
  });

  it('does not show error for valid article code', async () => {
    renderComponent();
    const user = userEvent.setup();

    const input = screen.getByRole('textbox');
    await user.type(input, 'VALID123');

    // Blur the field to trigger validation
    await user.tab();

    expect(
      screen.queryByText('Article code is too long'),
    ).not.toBeInTheDocument();
  });

  it('shows question mark icon for description tooltip', () => {
    renderComponent();

    // Check that the question mark icon is present (FormGroup renders it for description)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
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
    expect(
      screen.queryByText('Article code is too long'),
    ).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { openAndSelectOption } from '@/test/select';

import { PlanForm } from './PlanForm';

const renderComponent = (initialValues = {}) => {
  return render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <PlanForm />
        </form>
      )}
    />,
  );
};

describe('PlanForm', () => {
  it('renders all form fields', () => {
    renderComponent();

    // Check for form labels
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Billing period')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Article code')).toBeInTheDocument();
  });

  it('renders form fields with initial values', () => {
    const initialValues = {
      name: 'Test Plan',
      unit: 'month',
      description: 'Test description',
      article_code: 'TEST123',
    };

    renderComponent(initialValues);

    // Check that initial values are displayed
    expect(screen.getByDisplayValue('Test Plan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TEST123')).toBeInTheDocument();
    expect(screen.getByText('Per month')).toBeInTheDocument();
    // For markdown editor, check the text content instead of display value
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('allows entering plan name', async () => {
    renderComponent();
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'New Plan Name');

    expect(nameInput).toHaveValue('New Plan Name');
  });

  it('allows entering description', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Using test ID from global markdown mock
    const editorContent = screen.getByTestId('markdown-editor');
    await user.type(editorContent, 'This is a test description');
    expect(editorContent).toHaveValue('This is a test description');
  });

  it('allows entering article code', async () => {
    renderComponent();
    const user = userEvent.setup();

    const articleCodeInput = screen.getByLabelText(/Article code/i);
    await user.type(articleCodeInput, 'ART001');

    expect(articleCodeInput).toHaveValue('ART001');
  });

  it('allows selecting billing period', async () => {
    const user = userEvent.setup();
    renderComponent();

    await openAndSelectOption(user, 'Billing period', 'Per half month');

    expect(screen.getByText('Per half month')).toBeInTheDocument();
  });

  it('displays form group descriptions', () => {
    renderComponent();

    // Check for description text in ArticleCodeField
    expect(screen.getByText('Article code')).toBeInTheDocument();
  });
});

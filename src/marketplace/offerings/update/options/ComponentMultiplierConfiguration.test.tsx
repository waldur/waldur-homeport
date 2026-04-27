import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ComponentMultiplierConfiguration } from './ComponentMultiplierConfiguration';

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

const mockOffering = {
  components: [
    {
      type: 'storage',
      name: 'Storage',
      billing_type: 'limit',
    },
    {
      type: 'ram',
      name: 'RAM',
      billing_type: 'limit',
    },
    {
      type: 'cpu',
      name: 'CPU',
      billing_type: 'usage',
    },
  ],
};

const renderComponent = (props: any = {}) => {
  return render(
    <Form
      onSubmit={props.onSubmit || (() => {})}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ComponentMultiplierConfiguration
            offering={mockOffering as any}
            {...props}
          />
          <button type="submit">Submit</button>
        </form>
      )}
    />,
  );
};

describe('ComponentMultiplierConfiguration', () => {
  it('renders all fields', () => {
    renderComponent();
    expect(screen.getByText(/Component Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiplication Factor/i)).toBeInTheDocument();
    expect(screen.getByText(/Minimum Limit/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum Limit/i)).toBeInTheDocument();
  });

  it('filters limit-based components', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText(/Select component/i));

    expect(screen.getByText('Storage (storage)')).toBeInTheDocument();
    expect(screen.getByText('RAM (ram)')).toBeInTheDocument();
    expect(screen.queryByText('CPU (cpu)')).not.toBeInTheDocument();
  });
});

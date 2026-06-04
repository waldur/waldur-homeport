import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { mockListResponse } from '@/test/utils';

import { ImportConfigurationTab } from './ImportConfigurationTab';

const renderComponent = (initialValues = {}) => {
  return render(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      render={() => <ImportConfigurationTab />}
    />,
  );
};

describe('ImportConfigurationTab', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceCategoriesList).mockResolvedValue(
      mockListResponse([
        { uuid: 'cat-1', title: 'Compute' },
        { uuid: 'cat-2', title: 'Storage' },
      ]),
    );
  });

  it('renders all import options checkboxes', () => {
    renderComponent();

    expect(screen.getByLabelText(/Import components/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Import plans/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Import screenshots/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Import files/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Import access endpoints/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Import organization groups/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Import terms of service/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Import plugin options/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Import secret options/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Overwrite existing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preserve state/i)).toBeInTheDocument();
  });

  it('auto-sets category based on _category_name', async () => {
    // Initial state with metadata but no selected category
    const initialValues = {
      _category_name: 'Compute',
      category: null,
    };

    renderComponent(initialValues);

    // Should call API to find the category
    await waitFor(() => {
      expect(marketplaceCategoriesList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ title: 'Compute' }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Compute')).toBeInTheDocument();
    });
  });

  it('allows manual category selection via AsyncSelect', async () => {
    renderComponent();

    const select = screen.getByLabelText(/Target category/i);
    await user.click(select);

    // Wait for options to load
    const option = await screen.findByText('Storage');
    await user.click(option);

    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  it('displays descriptions for import options', () => {
    renderComponent();

    expect(
      screen.getByText(/Include offering components in the import/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/WARNING: Import secret options/i),
    ).toBeInTheDocument();
  });
});

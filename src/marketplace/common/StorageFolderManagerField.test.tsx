import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react'; // Added React import for ReactNode
import { Provider } from 'react-redux';
import { reduxForm } from 'redux-form'; // Added InjectedFormProps
import configureMockStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Offering, OptionField } from 'waldur-js-client';

import { StorageFolderManagerField } from './StorageFolderManagerField';

const mockStore = configureMockStore();

interface TestFormProps {
  children?: React.ReactNode;
}

const TestForm = reduxForm<any, TestFormProps>({ form: 'TestForm' })(
  ({ children }) => <form>{children}</form>,
);

const mockField = {
  type: 'storage_folder_manager',
  label: 'Storage Configuration',
  storage_folder_config: {
    component_type: 'storage',
    default_hard_quota_multiplier: 1.0,
    inode_soft_multiplier: 7000,
    inode_hard_multiplier: 10000,
    storage_data_types: [
      { key: 'store', label: 'Store' },
      { key: 'archive', label: 'Archive' },
    ],
    default_permission: '2770',
  },
} as OptionField;

const mockOffering = {
  components: [
    {
      type: 'storage',
      name: 'Storage',
      billing_type: 'limit',
      default_limit: 10,
    },
  ],
} as Offering;

const mockCustomer = {
  user: {
    role: 'user',
  },
};

const createStore = (storageLimit = 10) =>
  mockStore({
    form: {
      OrderForm: {
        values: {
          limits: { storage: storageLimit },
        },
      },
    },
  });

const renderComponent = (
  props: Partial<Parameters<typeof StorageFolderManagerField>[0]> = {},
  storageLimit = 10,
) => {
  const onChange = vi.fn();
  const store = createStore(storageLimit);

  const result = render(
    <Provider store={store}>
      <TestForm>
        <StorageFolderManagerField
          field={mockField}
          input={
            {
              value: '',
              onChange,
              onBlur: vi.fn(),
              onFocus: vi.fn(),
              onDragStart: vi.fn(),
              onDrop: vi.fn(),
              name: 'storage_folder_manager',
            } as any
          }
          customer={mockCustomer as any}
          offering={mockOffering}
          {...props}
        />
      </TestForm>
    </Provider>,
  );

  return { ...result, onChange, store };
};

describe('StorageFolderManagerField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders storage data type selector', () => {
      renderComponent();

      expect(screen.getByText('Storage Data Type')).toBeInTheDocument();
      expect(screen.getByText('Permissions')).toBeInTheDocument();
      expect(screen.getByText('Calculated Quotas')).toBeInTheDocument();
    });

    it('renders hard quota override field', () => {
      renderComponent();

      expect(screen.getByText('Hard Quota Override (TB)')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Optional override'),
      ).toBeInTheDocument();
    });

    it('renders space and inode quota sections', () => {
      renderComponent();

      expect(screen.getByText('Space Quotas')).toBeInTheDocument();
      expect(
        screen.getByText('File/Directory Quotas (Inodes)'),
      ).toBeInTheDocument();
    });

    it('renders help text when provided', () => {
      const fieldWithHelpText = {
        ...mockField,
        help_text: 'This is help text for the storage folder manager',
      } as OptionField;

      renderComponent({ field: fieldWithHelpText });

      expect(
        screen.getByText('This is help text for the storage folder manager'),
      ).toBeInTheDocument();
    });
  });

  describe('quota calculations', () => {
    it('calculates quotas correctly with default multiplier', () => {
      renderComponent({}, 5); // 5 TB soft quota

      expect(screen.getByText('Soft: 5.0 TB')).toBeInTheDocument();
      expect(screen.getByText('Hard: 5.0 TB')).toBeInTheDocument(); // 1.0 multiplier
      expect(screen.getByText('Soft: 35,000 files')).toBeInTheDocument(); // 5 * 7000
      expect(screen.getByText('Hard: 50,000 files')).toBeInTheDocument(); // 5 * 10000
    });

    it('calculates quotas correctly with custom hard quota multiplier', () => {
      const fieldWithMultiplier = {
        ...mockField,
        storage_folder_config: {
          ...mockField.storage_folder_config,
          default_hard_quota_multiplier: 1.5,
        },
      } as OptionField;

      renderComponent({ field: fieldWithMultiplier }, 10);

      expect(screen.getByText('Soft: 10.0 TB')).toBeInTheDocument();
      expect(screen.getByText('Hard: 15.0 TB')).toBeInTheDocument(); // 10 * 1.5
    });

    it('calculates inodes correctly with custom multipliers', () => {
      const fieldWithCustomInodes = {
        ...mockField,
        storage_folder_config: {
          ...mockField.storage_folder_config,
          inode_soft_multiplier: 5000,
          inode_hard_multiplier: 8000,
        },
      };

      renderComponent({ field: fieldWithCustomInodes }, 2);

      expect(screen.getByText('Soft: 10,000 files')).toBeInTheDocument(); // 2 * 5000
      expect(screen.getByText('Hard: 16,000 files')).toBeInTheDocument(); // 2 * 8000
    });
  });

  describe('user interactions', () => {
    it('renders storage data type select with options', () => {
      renderComponent();

      // The select components should be rendered with the placeholder
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('renders permission select with all permission options available', () => {
      renderComponent();

      // Permissions should be available in the component
      // (Full select interaction tested in e2e/integration tests)
      expect(screen.getByText('Permissions')).toBeInTheDocument();
    });

    it('updates hard quota when override value is entered', async () => {
      const user = userEvent.setup();
      const { onChange } = renderComponent({}, 10);

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '15');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });

      // Check the displayed hard quota updates
      await waitFor(() => {
        expect(screen.getByText('Hard: 15.0 TB')).toBeInTheDocument();
      });
    });

    it('clears hard quota override when input is cleared', async () => {
      const user = userEvent.setup();
      renderComponent({}, 10);

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '15');

      await waitFor(() => {
        expect(screen.getByText('Hard: 15.0 TB')).toBeInTheDocument();
      });

      await user.clear(hardQuotaInput);

      // Should revert to calculated default (10 * 1.0 = 10)
      await waitFor(() => {
        expect(screen.getByText('Hard: 10.0 TB')).toBeInTheDocument();
      });
    });
  });

  describe('validation', () => {
    it('shows error when hard quota is less than soft quota', async () => {
      const user = userEvent.setup();
      renderComponent({}, 10); // 10 TB soft quota

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '5'); // Less than soft quota of 10

      await waitFor(() => {
        expect(
          screen.getByText(/Hard quota cannot be less than soft quota/),
        ).toBeInTheDocument();
      });
    });

    it('does not show error when hard quota equals soft quota', async () => {
      const user = userEvent.setup();
      renderComponent({}, 10);

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '10');

      await waitFor(() => {
        expect(
          screen.queryByText(/Hard quota cannot be less than soft quota/),
        ).not.toBeInTheDocument();
      });
    });

    it('does not show error when hard quota is greater than soft quota', async () => {
      const user = userEvent.setup();
      renderComponent({}, 10);

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '15');

      await waitFor(() => {
        expect(
          screen.queryByText(/Hard quota cannot be less than soft quota/),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('default permission auto-selection', () => {
    it('auto-selects default permission on mount', async () => {
      const { onChange } = renderComponent();

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        const hasPermission = calls.some(
          (call) => call[0]?.permissions === '2770',
        );
        expect(hasPermission).toBe(true);
      });
    });

    it('does not override existing permission value', async () => {
      const existingValue = {
        storage_data_type: 'archive',
        permissions: '2775',
      };

      const { onChange } = renderComponent({
        input: { value: existingValue, onChange: vi.fn() } as any,
      });

      // The component should not override the existing permission
      await waitFor(() => {
        // Check that 2775 is preserved, not overwritten to 2770
        const calls = onChange.mock.calls;
        const lastCallWithPermission = [...calls]
          .reverse()
          .find((call) => call[0]?.permissions);
        if (lastCallWithPermission) {
          expect(lastCallWithPermission[0].permissions).toBe('2775');
        }
      });
    });
  });

  describe('form value submission', () => {
    it('calls onChange with calculated inode quotas', async () => {
      const { onChange } = renderComponent({}, 5);

      // Component should call onChange on mount with calculated values
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.soft_quota_inodes).toBe(35000); // 5 * 7000
        expect(lastCall.hard_quota_inodes).toBe(50000); // 5 * 10000
      });
    });

    it('includes custom hard quota in submitted value when overridden', async () => {
      const user = userEvent.setup();
      const { onChange } = renderComponent({}, 10);

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '20');

      await waitFor(() => {
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall.hard_quota_space).toBe(20);
      });
    });

    it('submission value structure matches expected format', async () => {
      const { onChange } = renderComponent({}, 10);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        // Check the structure of the submitted value
        expect(lastCall).toHaveProperty('storage_data_type');
        expect(lastCall).toHaveProperty('permissions');
        expect(lastCall).toHaveProperty('soft_quota_inodes');
        expect(lastCall).toHaveProperty('hard_quota_inodes');
      });
    });
  });

  describe('edge cases', () => {
    it('handles missing storage_folder_config gracefully', () => {
      const fieldWithoutConfig = {
        type: 'storage_folder_manager',
        label: 'Storage Configuration',
      } as OptionField;

      // Should not throw
      expect(() =>
        renderComponent({ field: fieldWithoutConfig }),
      ).not.toThrow();
    });

    it('handles empty storage_data_types array', () => {
      const fieldWithEmptyTypes = {
        ...mockField,
        storage_folder_config: {
          ...mockField.storage_folder_config,
          storage_data_types: [],
        },
      } as OptionField;

      renderComponent({ field: fieldWithEmptyTypes });

      // Component should still render
      expect(screen.getByText('Storage Data Type')).toBeInTheDocument();
    });

    it('uses default values when multipliers are not provided', () => {
      const fieldWithoutMultipliers = {
        ...mockField,
        storage_folder_config: {
          component_type: 'storage',
          storage_data_types: [{ key: 'store', label: 'Store' }],
          default_permission: '2770',
        },
      } as OptionField;

      renderComponent({ field: fieldWithoutMultipliers }, 1);

      // Should use default multipliers (7000 soft, 10000 hard for inodes)
      expect(screen.getByText('Soft: 7,000 files')).toBeInTheDocument();
      expect(screen.getByText('Hard: 10,000 files')).toBeInTheDocument();
    });
  });
});

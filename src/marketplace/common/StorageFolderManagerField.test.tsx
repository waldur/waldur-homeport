import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form } from 'react-final-form';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Offering, OptionField } from 'waldur-js-client';

import { StorageFolderManagerField } from './StorageFolderManagerField';

const mockStore = configureMockStore();

const createMockField = (overrides = {}): OptionField =>
  ({
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

    ...overrides,
  }) as OptionField;

const createMockOffering = (): Offering =>
  ({
    components: [
      {
        type: 'storage',
        name: 'Storage',
        billing_type: 'limit',
        default_limit: 10,
      },
    ],
  }) as Offering;

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

interface RenderOptions {
  field?: OptionField;
  inputValue?: any;
  offering?: Offering;
  storageLimit?: number;
}

const renderComponent = ({
  field = createMockField(),
  inputValue = '',
  offering = createMockOffering(),
  storageLimit = 10,
}: RenderOptions = {}) => {
  const store = createStore(storageLimit);
  const onChange = vi.fn();

  const Wrapper = ({ limit = storageLimit, val = inputValue }) => (
    <Provider store={store}>
      <Form
        onSubmit={() => {}}
        initialValues={{
          limits: { storage: limit },
          storage_folder_manager: val,
        }}
        enableReinitialize
      >
        {() => (
          <Field name="storage_folder_manager">
            {({ input }) => (
              <StorageFolderManagerField
                field={field}
                input={{
                  ...input,
                  onChange: (value) => {
                    input.onChange(value);
                    onChange(value);
                  },
                }}
                offering={offering}
              />
            )}
          </Field>
        )}
      </Form>
    </Provider>
  );

  const result = render(<Wrapper />);

  return {
    ...result,
    onChange,
    store,
    rerender: (newOptions: RenderOptions = {}) =>
      result.rerender(
        <Wrapper
          limit={
            newOptions.storageLimit !== undefined
              ? newOptions.storageLimit
              : storageLimit
          }
          val={
            newOptions.inputValue !== undefined
              ? newOptions.inputValue
              : inputValue
          }
        />,
      ),
  };
};

describe('StorageFolderManagerField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all main form sections', () => {
      renderComponent();

      expect(screen.getByText('Storage Data Type')).toBeInTheDocument();
      expect(screen.getByText('Permissions')).toBeInTheDocument();
      expect(screen.getByText('Hard Quota Override (TB)')).toBeInTheDocument();
      expect(screen.getByText('Calculated Quotas')).toBeInTheDocument();
    });

    it('renders quota display sections', () => {
      renderComponent();

      expect(screen.getByText('Space Quotas')).toBeInTheDocument();
      expect(
        screen.getByText('File/Directory Quotas (Inodes)'),
      ).toBeInTheDocument();
    });

    it('renders help text when provided', () => {
      const field = createMockField({
        help_text: 'This is help text for the storage folder manager',
      });

      renderComponent({ field });

      expect(
        screen.getByText('This is help text for the storage folder manager'),
      ).toBeInTheDocument();
    });

    it('renders placeholder text for inputs', () => {
      const field = createMockField();
      // @ts-ignore
      field.storage_folder_config.default_permission = '';

      renderComponent({ field });

      expect(
        screen.getByPlaceholderText('Optional override'),
      ).toBeInTheDocument();
      expect(screen.getByText('Select storage data type')).toBeInTheDocument();
      expect(screen.getByText('Select permissions')).toBeInTheDocument();
    });
  });

  describe('Quota Calculations', () => {
    it('calculates quotas with default multiplier', () => {
      renderComponent({ storageLimit: 5 });

      expect(screen.getByText('Soft: 5.0 TB')).toBeInTheDocument();
      expect(screen.getByText('Hard: 5.0 TB')).toBeInTheDocument(); // 1.0 multiplier
      expect(screen.getByText('Soft: 35,000 files')).toBeInTheDocument(); // 5 * 7000
      expect(screen.getByText('Hard: 50,000 files')).toBeInTheDocument(); // 5 * 10000
    });

    it('calculates quotas with custom hard quota multiplier', () => {
      const field = createMockField({
        storage_folder_config: {
          component_type: 'storage',
          default_hard_quota_multiplier: 1.5,
          inode_soft_multiplier: 7000,
          inode_hard_multiplier: 10000,
          storage_data_types: [{ key: 'store', label: 'Store' }],
          default_permission: '2770',
        },
      });

      renderComponent({ field, storageLimit: 10 });

      expect(screen.getByText('Soft: 10.0 TB')).toBeInTheDocument();
      expect(screen.getByText('Hard: 15.0 TB')).toBeInTheDocument(); // 10 * 1.5
    });

    it('calculates inodes with custom multipliers', () => {
      const field = createMockField({
        storage_folder_config: {
          component_type: 'storage',
          default_hard_quota_multiplier: 1.0,
          inode_soft_multiplier: 5000,
          inode_hard_multiplier: 8000,
          storage_data_types: [{ key: 'store', label: 'Store' }],
          default_permission: '2770',
        },
      });

      renderComponent({ field, storageLimit: 2 });

      expect(screen.getByText('Soft: 10,000 files')).toBeInTheDocument();
      expect(screen.getByText('Hard: 16,000 files')).toBeInTheDocument();
    });

    it('updates hard quota calculation when override is provided', async () => {
      const user = userEvent.setup();
      renderComponent({ storageLimit: 10 });

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '15');

      await waitFor(() => {
        expect(screen.getByText('Hard: 15.0 TB')).toBeInTheDocument();
      });
    });

    it('recalculates inode quotas based on hard quota override', async () => {
      renderComponent({ storageLimit: 10 });

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      fireEvent.change(hardQuotaInput, { target: { value: '20' } });

      await waitFor(() => {
        expect(screen.getByText('Hard: 200,000 files')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('renders storage data type select', () => {
      renderComponent();

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('clears hard quota override and reverts to default', async () => {
      const user = userEvent.setup();
      renderComponent({ storageLimit: 10 });

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

    it('calls onChange when hard quota is updated', async () => {
      const user = userEvent.setup();
      const { onChange } = renderComponent({ storageLimit: 10 });

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '15');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Validation', () => {
    it('shows error when hard quota is less than soft quota', async () => {
      const user = userEvent.setup();
      renderComponent({ storageLimit: 10 });

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '5'); // Less than soft quota of 10

      await waitFor(() => {
        expect(
          screen.getByText(/Hard quota cannot be less than soft quota/),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Default Permission Auto-selection', () => {
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
      const inputValue = {
        storage_data_type: 'archive',
        permissions: '2775',
      };

      const { onChange } = renderComponent({ inputValue });

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

    it('respects permission from initial input value', async () => {
      const field = createMockField();
      // @ts-ignore
      field.storage_folder_config.default_permission = '';

      const inputValue = {
        storage_data_type: 'store',
        permissions: '2770',
        hard_quota_space: '',
      };

      renderComponent({ field, inputValue });

      await waitFor(() => {
        expect(screen.getByText(/2770/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Value Submission', () => {
    it('calls onChange with calculated inode quotas', async () => {
      const { onChange } = renderComponent({ storageLimit: 5 });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.soft_quota_inodes).toBe(35000); // 5 * 7000
        expect(lastCall.hard_quota_inodes).toBe(50000); // 5 * 10000
      });
    });

    it('includes custom hard quota in submitted value', async () => {
      const user = userEvent.setup();
      const { onChange } = renderComponent({ storageLimit: 10 });

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '20');

      await waitFor(() => {
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall.hard_quota_space).toBe(20);
      });
    });

    it('omits hard_quota_space when not overridden', async () => {
      const { onChange } = renderComponent({ storageLimit: 10 });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        if (calls.length === 0) return;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.hard_quota_space).toBeUndefined();
      });
    });

    it('submission value has correct structure', async () => {
      const { onChange } = renderComponent({ storageLimit: 10 });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        if (calls.length === 0) return;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall).toHaveProperty('storage_data_type');
        expect(lastCall).toHaveProperty('permissions');
        expect(lastCall).toHaveProperty('soft_quota_inodes');
        expect(lastCall).toHaveProperty('hard_quota_inodes');
      });
    });

    it('rounds inode values to whole numbers', async () => {
      const { onChange } = renderComponent({ storageLimit: 3 });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(Number.isInteger(lastCall.soft_quota_inodes)).toBe(true);
        expect(Number.isInteger(lastCall.hard_quota_inodes)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing storage_folder_config gracefully', () => {
      const field = {
        type: 'storage_folder_manager',
        label: 'Storage Configuration',
      } as OptionField;

      expect(() => renderComponent({ field })).not.toThrow();
    });

    it('handles empty storage_data_types array', () => {
      const field = createMockField({
        storage_folder_config: {
          component_type: 'storage',
          storage_data_types: [],
          default_permission: '2770',
        },
      });

      renderComponent({ field });

      expect(screen.getByText('Storage Data Type')).toBeInTheDocument();
    });

    it('uses default multiplier values when not provided', () => {
      const field = createMockField({
        storage_folder_config: {
          component_type: 'storage',
          storage_data_types: [{ key: 'store', label: 'Store' }],
          default_permission: '2770',
        },
      });

      renderComponent({ field, storageLimit: 1 });

      expect(screen.getByText('Soft: 7,000 files')).toBeInTheDocument();
      expect(screen.getByText('Hard: 10,000 files')).toBeInTheDocument();
    });

    it('handles zero storage limit', () => {
      renderComponent({ storageLimit: 0 });

      expect(screen.getByText('Soft: 0.0 TB')).toBeInTheDocument();
      expect(screen.getByText('Hard: 0.0 TB')).toBeInTheDocument();
      expect(screen.getByText('Soft: 0 files')).toBeInTheDocument();
      expect(screen.getByText('Hard: 0 files')).toBeInTheDocument();
    });

    it('handles missing offering gracefully', () => {
      expect(() =>
        renderComponent({ offering: undefined as any }),
      ).not.toThrow();
    });

    it('falls back to default limit when offering component not found', () => {
      const offering = {
        components: [
          {
            type: 'different_type',
            name: 'Different',
            billing_type: 'limit',
            default_limit: 20,
          },
        ],
      } as Offering;

      const store = mockStore({
        form: {
          OrderForm: {
            values: {
              // No limits
            },
          },
        },
      });

      render(
        <Provider store={store}>
          <Form onSubmit={() => {}}>
            {() => (
              <StorageFolderManagerField
                field={createMockField()}
                input={{ value: '', onChange: vi.fn(), name: 'test' } as any}
                offering={offering}
              />
            )}
          </Form>
        </Provider>,
      );

      // Should use fallback of 1 TB
      expect(screen.getByText('Soft: 1.0 TB')).toBeInTheDocument();
    });

    it('handles decimal hard quota inputs', async () => {
      const user = userEvent.setup();
      renderComponent({ storageLimit: 10 });

      const hardQuotaInput = screen.getByPlaceholderText('Optional override');
      await user.type(hardQuotaInput, '12.5');

      await waitFor(() => {
        expect(screen.getByText('Hard: 12.5 TB')).toBeInTheDocument();
      });
    });
  });

  describe('Reactivity', () => {
    it('recalculates quotas when storage limit changes in form', async () => {
      const { rerender } = renderComponent({ storageLimit: 5 });

      expect(screen.getByText('Soft: 5.0 TB')).toBeInTheDocument();

      rerender({ storageLimit: 10 });

      await waitFor(() => {
        expect(screen.getByText('Soft: 10.0 TB')).toBeInTheDocument();
      });
    });
  });
});

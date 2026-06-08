import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { fetchOpenstackOptions } from './fetchOpenstackOptions';
import { OptionsForm } from './OptionsForm';

vi.mock('./fetchOpenstackOptions', () => ({
  fetchOpenstackOptions: vi.fn(),
}));

vi.mock('../utils', () => ({
  isExperimentalUiComponentsVisible: vi.fn(() => true),
}));

vi.mock('./ConditionalCascadeField', () => ({
  ConditionalCascadeField: () => <div data-testid="mock-conditional-cascade" />,
}));

vi.mock('./ComponentMultiplierField', () => ({
  ComponentMultiplierField: () => (
    <div data-testid="mock-component-multiplier" />
  ),
}));

vi.mock('./SingleDatacenterK8sConfigurationForm', () => ({
  SingleDatacenterK8sConfigurationForm: () => (
    <div data-testid="mock-k8s-single" />
  ),
}));

vi.mock('./MultiDatacenterK8sConfigurationForm', () => ({
  MultiDatacenterK8sConfigurationForm: () => (
    <div data-testid="mock-k8s-multi" />
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('OptionsForm Integration', () => {
  const renderForm = (options: any, initialValues = {}, formProps = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Form
          onSubmit={vi.fn()}
          initialValues={initialValues}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <OptionsForm
                options={options}
                customer={{ uuid: 'test-customer-uuid' }}
                {...formProps}
              />
              <button type="submit">Submit</button>
            </form>
          )}
        />
      </QueryClientProvider>,
    );
  };

  describe('Core rendering behaviors', () => {
    it('renders nothing if options or order is empty', () => {
      renderForm({ options: {}, order: [] });
      // OptionsForm should render nothing. The only interactive element is the test wrapper's Submit button.
      expect(screen.queryAllByRole('textbox')).toHaveLength(0);
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
    });

    it('skips rendering if option key is missing in options object', () => {
      const options = {
        order: ['exists', 'missing'],
        options: {
          exists: { type: 'string', label: 'I Exist' },
        },
      };

      renderForm(options);
      expect(screen.getByText('I Exist')).toBeInTheDocument();
      expect(screen.queryByText('missing')).not.toBeInTheDocument();
    });

    it('handles help text properly', () => {
      const options = {
        order: ['helper'],
        options: {
          helper: {
            type: 'string',
            label: 'Helper Field',
            help_text: 'This is a tooltip text',
          },
        },
      };

      renderForm(options);
      expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
    });
  });

  describe('Field type integrations', () => {
    it('renders default string field as textbox', () => {
      renderForm({
        order: ['field1'],
        options: { field1: { type: 'string', label: 'String Field' } },
      });
      expect(screen.getByText('String Field')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders text (textarea) field', () => {
      renderForm({
        order: ['field1'],
        options: { field1: { type: 'text', label: 'Text Field' } },
      });
      expect(screen.getByText('Text Field')).toBeInTheDocument();
      // textareas are treated as generic textboxes by ARIA
      const input = screen.getByRole('textbox');
      expect(input.tagName.toLowerCase()).toBe('textarea');
    });

    it('renders boolean field as checkbox', () => {
      renderForm({
        order: ['field1'],
        options: { field1: { type: 'boolean', label: 'Boolean Field' } },
      });
      expect(screen.getByText('Boolean Field')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders integer field as spinbutton', () => {
      renderForm({
        order: ['field1'],
        options: { field1: { type: 'integer', label: 'Integer Field' } },
      });
      expect(screen.getByText('Integer Field')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('renders select_string field as combobox', () => {
      renderForm({
        order: ['field1'],
        options: {
          field1: {
            type: 'select_string',
            label: 'Select String',
            choices: ['A', 'B'],
          },
        },
      });
      expect(screen.getByText('Select String')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders select_string_multi field as checkbox group', () => {
      renderForm({
        order: ['field1'],
        options: {
          field1: {
            type: 'select_string_multi',
            label: 'Select Multiple String',
            choices: ['Option A', 'Option B'],
          },
        },
      });
      expect(screen.getByText('Select Multiple String')).toBeInTheDocument();
      // Should render a checkbox for each choice
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('renders async select for tenants', () => {
      renderForm({
        order: ['tenant'],
        options: {
          tenant: { type: 'select_openstack_tenant', label: 'Tenant Field' },
        },
      });
      expect(screen.getByText('Tenant Field')).toBeInTheDocument();
      expect(screen.getByText('Select tenant...')).toBeInTheDocument();
    });

    it('renders async select for multiple tenants', () => {
      renderForm({
        order: ['tenants'],
        options: {
          tenants: {
            type: 'select_multiple_openstack_tenants',
            label: 'Tenants Field',
          },
        },
      });
      expect(screen.getByText('Tenants Field')).toBeInTheDocument();
      expect(screen.getByText('Select tenants...')).toBeInTheDocument();
    });

    it('renders async select for instances', () => {
      renderForm({
        order: ['instance'],
        options: {
          instance: {
            type: 'select_openstack_instance',
            label: 'Instance Field',
          },
        },
      });
      expect(screen.getByText('Instance Field')).toBeInTheDocument();
      expect(screen.getByText('Select instance...')).toBeInTheDocument();
    });

    it('renders select_multiple_openstack_instances async select', () => {
      renderForm({
        order: ['instances'],
        options: {
          instances: {
            type: 'select_multiple_openstack_instances',
            label: 'Instances Field',
          },
        },
      });
      expect(screen.getByText('Instances Field')).toBeInTheDocument();
      expect(screen.getByText('Select instance...')).toBeInTheDocument();
    });

    it('renders date field', () => {
      renderForm({
        order: ['date_field'],
        options: { date_field: { type: 'date', label: 'Date Field' } },
      });
      expect(screen.getByText('Date Field')).toBeInTheDocument();
    });

    it('renders time field', () => {
      renderForm({
        order: ['time_field'],
        options: { time_field: { type: 'time', label: 'Time Field' } },
      });
      expect(screen.getByText('Time Field')).toBeInTheDocument();
    });

    it('mounts complex component types without crashing and passes correct field mappings', () => {
      const options = {
        order: [
          'cond_cascade',
          'comp_mult',
          'folder_mgr',
          'k8s_single',
          'k8s_multi',
        ],
        options: {
          cond_cascade: { type: 'conditional_cascade', label: 'Cascade' },
          comp_mult: { type: 'component_multiplier', label: 'Multiplier' },
          folder_mgr: { type: 'storage_folder_manager', label: 'Folder Mgr' },
          k8s_single: {
            type: 'single_datacenter_k8s_config',
            label: 'K8s Single',
          },
          k8s_multi: {
            type: 'multi_datacenter_k8s_config',
            label: 'K8s Multi',
          },
        },
      };

      // Ensure they render based on the OptionForm switch map
      renderForm(options);

      expect(
        screen.getByTestId('mock-conditional-cascade'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('mock-component-multiplier'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('mock-k8s-single')).toBeInTheDocument();
      expect(screen.getByTestId('mock-k8s-multi')).toBeInTheDocument();
      // Storage folder manager isn't explicitly mocked above, but it renders a FormGroup/Select natively.
      expect(screen.getByText('Folder Mgr')).toBeInTheDocument();
    });
  });

  describe('Validation integration', () => {
    it('applies required validation and shows error message on blur', async () => {
      renderForm({
        order: ['mandatory'],
        options: {
          mandatory: {
            type: 'string',
            label: 'Mandatory String',
            required: true,
          },
        },
      });

      const label = screen.getByText('Mandatory String');
      expect(label).toHaveClass('required');

      const input = screen.getByRole('textbox');
      // Touch and leave the field to trigger react-final-form validation
      await userEvent.click(input);
      await userEvent.tab();

      expect(
        await screen.findByText(/This field is required/i),
      ).toBeInTheDocument();
    });

    it('evaluates cross-field validation dynamically', async () => {
      renderForm(
        {
          order: ['min_val', 'max_val'],
          options: {
            min_val: { type: 'integer', label: 'Min' },
            max_val: {
              type: 'integer',
              label: 'Max',
              validators: [{ type: 'gt', target_field: 'min_val' }],
            },
          },
        },
        {
          attributes: { min_val: 10 },
        },
      );

      const inputs = screen.getAllByRole('spinbutton');
      const maxInput = inputs[1];

      // Enter a value smaller than min_val (10)
      await userEvent.click(maxInput);
      await userEvent.clear(maxInput);
      await userEvent.type(maxInput, '5');

      // Submit the form to aggressively trigger validation display
      await userEvent.click(screen.getByText('Submit'));

      expect(
        await screen.findByText(/Must be greater than Min/i),
      ).toBeInTheDocument();

      // Fix the value to be valid
      await userEvent.clear(maxInput);
      await userEvent.type(maxInput, '15');
      await userEvent.click(screen.getByText('Submit'));

      expect(
        screen.queryByText(/Must be greater than Min/i),
      ).not.toBeInTheDocument();
    });

    it('evaluates gte, lt, lte cross-field validations', async () => {
      renderForm(
        {
          order: ['base_val', 'gte_val', 'lt_val', 'lte_val'],
          options: {
            base_val: { type: 'integer', label: 'Base' },
            gte_val: {
              type: 'integer',
              label: 'GTE',
              validators: [{ type: 'gte', target_field: 'base_val' }],
            },
            lt_val: {
              type: 'integer',
              label: 'LT',
              validators: [{ type: 'lt', target_field: 'base_val' }],
            },
            lte_val: {
              type: 'integer',
              label: 'LTE',
              validators: [{ type: 'lte', target_field: 'base_val' }],
            },
          },
        },
        {
          attributes: { base_val: 10 },
        },
      );

      const inputs = screen.getAllByRole('spinbutton');
      const gteInput = inputs[1];
      const ltInput = inputs[2];
      const lteInput = inputs[3];

      // Violate all rules
      await userEvent.type(gteInput, '5'); // 5 >= 10 is false
      await userEvent.type(ltInput, '15'); // 15 < 10 is false
      await userEvent.type(lteInput, '15'); // 15 <= 10 is false

      await userEvent.click(screen.getByText('Submit'));

      expect(
        await screen.findByText(/Must be greater than or equal to Base/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Must be less than Base/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Must be less than or equal to Base/i),
      ).toBeInTheDocument();
    });
  });

  describe('OpenStack loaders and Async Selects', () => {
    it('initializes async loaders for OpenStack fields', () => {
      renderForm({
        order: ['tenant', 'instance'],
        options: {
          tenant: { type: 'select_openstack_tenant', label: 'Tenant Field' },
          instance: {
            type: 'select_openstack_instance',
            label: 'Instance Field',
          },
        },
      });

      // Validates the loaders are pre-populated on mount
      expect(fetchOpenstackOptions).toHaveBeenCalledWith(
        'OpenStack.Tenant',
        'test-customer-uuid',
      );
      expect(fetchOpenstackOptions).toHaveBeenCalledWith(
        'OpenStack.Instance',
        'test-customer-uuid',
      );
    });

    it('fetches and displays options when tenant async select is opened', async () => {
      // Mock the returned loader function to provide fake options
      const mockLoadOptions = vi.fn().mockResolvedValue({
        options: [
          {
            project_name: 'Project Alpha',
            name: 'Tenant A',
            backend_id: 't-1',
          },
          {
            project_name: 'Project Alpha',
            name: 'Tenant B',
            backend_id: 't-2',
          },
        ],
      });
      vi.mocked(fetchOpenstackOptions).mockReturnValue(mockLoadOptions);

      renderForm({
        order: ['tenant'],
        options: {
          tenant: { type: 'select_openstack_tenant', label: 'Tenant Field' },
        },
      });

      // Find the select input by its combobox role and click to open the menu
      const combobox = screen.getByRole('combobox');
      await userEvent.click(combobox);

      // Verify the mock loader was triggered
      expect(mockLoadOptions).toHaveBeenCalled();

      // Verify the getOptionLabel formatter returns "Project / Name" correctly
      expect(
        await screen.findByText('Project Alpha / Tenant A'),
      ).toBeInTheDocument();
      expect(screen.getByText('Project Alpha / Tenant B')).toBeInTheDocument();

      // Select an option
      await userEvent.click(screen.getByText('Project Alpha / Tenant A'));

      // The selected value should now be displayed
      expect(screen.getByText('Project Alpha / Tenant A')).toBeInTheDocument();
    });

    it('fetches and displays options for multiple instances async select', async () => {
      const mockLoadOptions = vi.fn().mockResolvedValue({
        options: [
          {
            project_name: 'Project Beta',
            name: 'Instance X',
            backend_id: 'i-1',
          },
        ],
      });
      vi.mocked(fetchOpenstackOptions).mockReturnValue(mockLoadOptions);

      renderForm({
        order: ['instances'],
        options: {
          instances: {
            type: 'select_multiple_openstack_instances',
            label: 'Instances Field',
          },
        },
      });

      const combobox = screen.getByRole('combobox');
      await userEvent.click(combobox);

      expect(
        await screen.findByText('Project Beta / Instance X'),
      ).toBeInTheDocument();
    });
  });
});

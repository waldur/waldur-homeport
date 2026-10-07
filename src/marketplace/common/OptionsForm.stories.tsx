import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Form, FormSpy } from 'react-final-form';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { expect, userEvent, within } from 'storybook/test';

import { OptionsForm } from './OptionsForm';

/**
 * Order-form options as a customer sees them on the deploy page: what
 * `OptionsForm` adds on top of the fields themselves, which is choosing the
 * field for each option type and handing it the option's label and help text.
 * The fields are specified under Forms / Check controls / Form fields.
 */
const meta: Meta = {
  title: 'Marketplace/Order options',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const CUSTOMER = { uuid: 'customer-uuid' } as any;

const Harness = ({
  options,
  initialValues = {},
}: {
  options: any;
  initialValues?: Record<string, any>;
}) => {
  // useCustomer() reads the workspace even when a customer prop is passed.
  const store = configureStore()({ workspace: { customer: CUSTOMER } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Form
          onSubmit={() => undefined}
          initialValues={initialValues}
          render={() => (
            <div style={{ maxWidth: 480 }}>
              <OptionsForm options={options} customer={CUSTOMER} />
              <FormSpy subscription={{ values: true }}>
                {({ values }) => (
                  <code data-testid="form-value">{JSON.stringify(values)}</code>
                )}
              </FormSpy>
            </div>
          )}
        />
      </QueryClientProvider>
    </Provider>
  );
};

const readValue = (canvas: ReturnType<typeof within>) =>
  JSON.parse(canvas.getByTestId('form-value').textContent ?? '{}');

export const BooleanWithHelpText: Story = {
  render: () => (
    <Harness
      options={{
        order: ['backups', 'monitoring'],
        options: {
          backups: {
            type: 'boolean',
            label: 'Enable backups',
            help_text: 'Daily snapshots kept for 7 days.',
          },
          monitoring: { type: 'boolean', label: 'Enable monitoring' },
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The text the order form lost once: shown under the label, linked to the
    // switch as its description, and not part of its accessible name.
    const description = canvas.getByText('Daily snapshots kept for 7 days.');
    await expect(description).toBeVisible();
    const backups = canvas.getByRole('checkbox', { name: 'Enable backups' });
    await expect(backups).toHaveAccessibleDescription(
      'Daily snapshots kept for 7 days.',
    );
    // Both labels name exactly one control each.
    await expect(canvas.getAllByRole('checkbox')).toHaveLength(2);

    await userEvent.click(canvas.getByText('Enable backups'));
    await expect(backups).toBeChecked();
    await expect(readValue(canvas).attributes.backups).toBe(true);
  },
};

export const SelectStringMulti: Story = {
  render: () => (
    <Harness
      options={{
        order: ['features'],
        options: {
          features: {
            type: 'select_string_multi',
            label: 'Features',
            choices: ['ssh', 'vpn', 'gpu'],
          },
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('vpn'));
    await userEvent.click(canvas.getByLabelText('gpu'));
    await expect(readValue(canvas).attributes.features).toEqual(['vpn', 'gpu']);
    await userEvent.click(canvas.getByLabelText('vpn'));
    await expect(readValue(canvas).attributes.features).toEqual(['gpu']);
  },
};

export const MixedOptionTypes: Story = {
  render: () => (
    <Harness
      options={{
        order: ['name', 'size', 'flavor', 'ha'],
        options: {
          name: { type: 'string', label: 'Name', required: true },
          size: {
            type: 'integer',
            label: 'Size (GB)',
            help_text: 'Minimum 10',
          },
          flavor: {
            type: 'select_string',
            label: 'Flavor',
            choices: ['small', 'large'],
          },
          ha: {
            type: 'boolean',
            label: 'High availability',
            help_text: 'Runs two replicas.',
          },
        },
      }}
    />
  ),
};

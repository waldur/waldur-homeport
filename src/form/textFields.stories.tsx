import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Form, FormSpy } from 'react-final-form';
import { expect, userEvent, within } from 'storybook/test';

import { FilterBox } from './FilterBox';
import { BaseInputField, InputField } from './InputField';
import { BaseNumberField } from './NumberField';
import { ReadOnlyFormControl } from './ReadOnlyFormControl';
import { BaseTextField } from './TextField';

import {
  BaseSecretField,
  BaseStringField,
  EmailGroup,
  SecretGroup,
  StringGroup,
  TextGroup,
} from '.';

/**
 * The react-final-form adapters over waldur-ui's `Input` and `Textarea`:
 * `StringField`, `TextField`, `EmailField`, `SecretField` and `InputField`
 * (plus their `*Group` wrappers), and the pure `Base*Field` components behind
 * them.
 *
 * How the controls look on their own is specified by the `Input` and
 * `Textarea` pages under Forms. These stories cover what the adapters add:
 * the touched-and-invalid state reaching the control, the stored value, and
 * the legacy props (`solid`, `icon`, `rows`) still rendering.
 */
const meta: Meta = {
  title: 'Forms/Text inputs/Form fields',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const required = (value: string) => (value ? undefined : 'Required');

const Harness = ({
  initialValues = {},
  children,
}: {
  initialValues?: Record<string, any>;
  children: React.ReactNode;
}) => (
  <Form
    onSubmit={() => undefined}
    initialValues={initialValues}
    render={() => (
      <div style={{ maxWidth: 520 }}>
        {children}
        <FormSpy subscription={{ values: true }}>
          {({ values }) => (
            <code data-testid="form-value">{JSON.stringify(values)}</code>
          )}
        </FormSpy>
      </div>
    )}
  />
);

const readValue = (canvas: ReturnType<typeof within>) =>
  JSON.parse(canvas.getByTestId('form-value').textContent ?? '{}');

export const Groups: Story = {
  render: () => (
    <Harness initialValues={{ description: 'Line one\nLine two' }}>
      <StringGroup
        name="name"
        label="Name"
        placeholder="Enter name..."
        required
        validate={required}
      />
      <TextGroup name="description" label="Description" />
      <EmailGroup name="email" label="Email" placeholder="you@example.com" />
      <SecretGroup name="token" label="Token" />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByLabelText(/Name/);
    await userEvent.type(name, 'Alpha');
    await expect(readValue(canvas).name).toBe('Alpha');
    await userEvent.clear(name);
    await userEvent.tab();
    // Touched and empty: the control reports itself invalid.
    await expect(name).toHaveAttribute('aria-invalid', 'true');
  },
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-[520px] flex-col gap-4">
      <BaseStringField placeholder="Default" aria-label="Default" />
      <BaseStringField defaultValue="Invalid" isInvalid aria-label="Invalid" />
      <BaseStringField defaultValue="Disabled" disabled aria-label="Disabled" />
      <BaseStringField
        defaultValue="Read only"
        readOnly
        aria-label="Readonly"
      />
      <BaseStringField defaultValue="Solid" solid aria-label="Solid" />
      <BaseStringField
        placeholder="Search..."
        icon={<MagnifyingGlassIcon weight="bold" />}
        aria-label="With icon"
      />
      <BaseInputField type="number" defaultValue={42} aria-label="Number" />
      <BaseNumberField value={5} min={1} max={20} aria-label="Stepper" />
      <BaseNumberField value={5} unit="GB" aria-label="Stepper with unit" />
      <BaseNumberField value={50} max={20} aria-label="Stepper invalid" />
      <BaseNumberField
        value={5}
        showSteppers={false}
        unit="EUR"
        aria-label="Unit only"
      />
      <BaseSecretField
        defaultValue="s3cr3t"
        isInvalid
        aria-label="Secret invalid"
      />
      <BaseSecretField defaultValue="s3cr3t" aria-label="Secret" />
      <FilterBox type="search" defaultValue="query" aria-label="Filter" />
      <ReadOnlyFormControl label="Read only with addon" value="12" addon="GB" />
      <BaseTextField defaultValue="A textarea" aria-label="Textarea" />
      <BaseTextField
        defaultValue="Invalid textarea"
        isInvalid
        aria-label="Invalid textarea"
      />
      <BaseTextField
        defaultValue="Disabled solid textarea"
        solid
        disabled
        aria-label="Disabled textarea"
      />
    </div>
  ),
};

export const RawInputField: Story = {
  render: () => (
    <Harness initialValues={{ key: 'ENV' }}>
      <Field name="key" validate={required}>
        {({ input, meta }) => (
          <InputField input={input} meta={meta} placeholder="Key" />
        )}
      </Field>
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Key');
    await userEvent.clear(input);
    await userEvent.tab();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

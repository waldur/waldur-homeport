import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Field, Form, FormSpy, useForm } from 'react-final-form';
import { expect, userEvent, within } from 'storybook/test';

import { ModelsField } from '@/marketplace/resources/details/api-keys/keySettingsFields';
import { QuestionLikertFields } from '@/marketplace-checklist/checklists/questions/QuestionLikertFields';

import { SwitchField } from './SwitchField';

import { BooleanGroup, RadioGroup } from '.';

/**
 * The react-final-form adapters over waldur-ui's `Switch`, `Checkbox` and
 * `RadioGroup`: `BooleanGroup` (a switch), `SelectMultiBooleanGroup` (a list
 * of switches or checkboxes) and the form-level `RadioGroup`.
 *
 * How the controls look and behave on their own is specified by the
 * `Checkbox`, `Switch` and `Radio` pages next to this one. These stories cover
 * only what the adapters add: the field's label, description, tooltip and
 * required mark reaching the control, the stored value, and a locked field
 * staying locked. Every story asserts what is on screen, because a prop the
 * adapter does not read (`help_text` where `description` is meant) renders
 * fine and silently loses its text.
 *
 * `OptionsForm`, which builds these fields from an offering's options, is
 * covered under Marketplace / Order options.
 */
const meta: Meta = {
  title: 'Forms/Check controls/Form fields',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

/** A form around one or more fields, with the stored values printed below. */
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

// ── Switch: BooleanGroup ────────────────────────────────

export const SwitchLabelDescriptionTooltip: Story = {
  render: () => (
    <Harness initialValues={{ backups: false }}>
      <BooleanGroup
        name="backups"
        label="Enable backups"
        description="Daily snapshots kept for 7 days."
        tooltip="Backups are billed as storage."
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'Enable backups' });
    // The description is linked to the switch, and is not part of its name.
    await expect(control).toHaveAccessibleDescription(
      'Daily snapshots kept for 7 days.',
    );
    await expect(canvas.getByRole('button', { name: 'Help' })).toBeVisible();

    await userEvent.click(canvas.getByText('Enable backups'));
    await expect(control).toBeChecked();
    await expect(readValue(canvas).backups).toBe(true);

    // Reading the help must not flip the switch.
    await userEvent.click(canvas.getByRole('button', { name: 'Help' }));
    await expect(control).toBeChecked();
  },
};

export const SwitchDisabledAndReadOnly: Story = {
  render: () => (
    <Harness initialValues={{ a: true, b: true }}>
      <BooleanGroup name="a" label="Disabled" disabled />
      <BooleanGroup name="b" label="Read only" readOnly />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const control of canvas.getAllByRole('checkbox')) {
      await expect(control).toBeDisabled();
    }
    await userEvent.click(canvas.getByText('Read only'));
    await expect(readValue(canvas)).toEqual({ a: true, b: true });
  },
};

// ── Switch: SwitchField options ─────────────────────────

/** A switch bound straight to a field, the way dialogs without a FormGroup use it. */
const DirectSwitch = ({
  name = 'flag',
  ...props
}: { name?: string } & Omit<
  React.ComponentProps<typeof SwitchField>,
  'input' | 'meta'
>) => (
  <Field name={name} type="checkbox">
    {({ input, meta }) => <SwitchField input={input} meta={meta} {...props} />}
  </Field>
);

const trackOf = (control: HTMLElement) => control.parentElement as HTMLElement;
/** The label row `CheckLabel` draws around the track, description and label. */
const rowOf = (control: HTMLElement) =>
  trackOf(control).parentElement as HTMLElement;

export const SwitchSizes: Story = {
  render: () => (
    <Harness>
      <DirectSwitch name="md" aria-label="Medium" />
      <DirectSwitch name="sm" size="sm" aria-label="Small" />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const md = trackOf(canvas.getByRole('checkbox', { name: 'Medium' }));
    const sm = trackOf(canvas.getByRole('checkbox', { name: 'Small' }));
    // The legacy .form-switch (44×24) and .form-switch-sm (36×20).
    await expect(md.getBoundingClientRect()).toMatchObject({
      width: 44,
      height: 24,
    });
    await expect(sm.getBoundingClientRect()).toMatchObject({
      width: 36,
      height: 20,
    });
  },
};

export const SwitchAlignment: Story = {
  render: () => (
    <Harness>
      <DirectSwitch name="a" label="Default" description="Help text" />
      <DirectSwitch
        name="b"
        label="Centred"
        description="Help text"
        align="center"
      />
      <DirectSwitch name="c" label="No description" />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const align = (name: string) =>
      getComputedStyle(rowOf(canvas.getByRole('checkbox', { name })))
        .alignItems;
    // Beside a description the switch stays on the label's first line;
    // alone, it is taller than the text and centres on it.
    await expect(align('Default')).toBe('flex-start');
    await expect(align('Centred')).toBe('center');
    await expect(align('No description')).toBe('center');
  },
};

export const SwitchInline: Story = {
  render: () => (
    <Harness>
      <DirectSwitch name="a" label="Inline by default" />
      <DirectSwitch name="b" label="Full width" inline={false} />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const display = (name: string) =>
      getComputedStyle(rowOf(canvas.getByRole('checkbox', { name }))).display;
    await expect(display('Inline by default')).toBe('inline-flex');
    await expect(display('Full width')).toBe('flex');
  },
};

export const SwitchClassNameIdAndTestId: Story = {
  render: () => (
    <Harness>
      <DirectSwitch
        label="Notify me"
        className="story-row"
        id="notify-switch"
        data-testid="notify"
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'Notify me' });
    // The id and test id reach the input; the class lands on the outer row.
    await expect(control).toHaveAttribute('id', 'notify-switch');
    await expect(canvas.getByTestId('notify')).toBe(control);
    await expect(rowOf(control)).toHaveClass('story-row');
    await expect(canvas.getByText('Notify me')).toHaveAttribute(
      'for',
      'notify-switch',
    );
  },
};

export const SwitchBoundAsCheckbox: Story = {
  render: () => (
    <Harness initialValues={{ flag: true }}>
      <DirectSwitch label="Confirmed" />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'Confirmed' });
    // A field bound with type="checkbox" reads `input.checked`, and writes a
    // boolean, not the string "on".
    await expect(control).toBeChecked();
    await userEvent.click(control);
    await expect(readValue(canvas).flag).toBe(false);
    await userEvent.click(control);
    await expect(readValue(canvas).flag).toBe(true);
  },
};

const SeenByCallback = () => {
  const form = useForm();
  const [seen, setSeen] = useState('none');
  return (
    <>
      <DirectSwitch
        label="Notify me"
        onChange={(value) =>
          setSeen(`${value}/${String(form.getState().values.flag)}`)
        }
      />
      <code data-testid="seen">{seen}</code>
    </>
  );
};

export const SwitchOnChangeRunsAfterTheForm: Story = {
  render: () => (
    <Harness>
      <SeenByCallback />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Notify me' }));
    // The callback gets the new value, and the form already holds it.
    await expect(canvas.getByTestId('seen')).toHaveTextContent('true/true');
  },
};

// ── Checkbox list: SelectMultiBooleanGroup ──────────────

const MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-4-5'];

/** The API-key dialog's model picker: the real field in a real form. */
const ModelPicker = ({ disabled }: { disabled?: boolean }) => (
  <Harness initialValues={{ models: ['claude-sonnet-5-5'] }}>
    <ModelsField
      name="models"
      label="Allowed models"
      description="The key can call only the models you tick."
      options={MODELS}
      disabled={disabled}
    />
  </Harness>
);

export const CheckboxList: Story = {
  render: () => <ModelPicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    await expect(boxes).toHaveLength(3);
    // `checkboxes` asks for 20px boxes, not 44px switch tracks.
    for (const box of boxes) {
      await expect(box.parentElement).toHaveClass('size-[20px]');
    }
    await expect(
      canvas.getByRole('checkbox', { name: 'claude-sonnet-5-5' }),
    ).toBeChecked();

    await userEvent.click(canvas.getByLabelText('claude-opus-5-5'));
    await expect(readValue(canvas).models).toEqual([
      'claude-sonnet-5-5',
      'claude-opus-5-5',
    ]);
    await userEvent.click(canvas.getByLabelText('claude-sonnet-5-5'));
    await expect(readValue(canvas).models).toEqual(['claude-opus-5-5']);
  },
};

export const CheckboxListDisabled: Story = {
  render: () => <ModelPicker disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const box of canvas.getAllByRole('checkbox')) {
      await expect(box).toBeDisabled();
    }
    await userEvent.click(canvas.getByText('claude-opus-5-5'));
    await expect(readValue(canvas).models).toEqual(['claude-sonnet-5-5']);
  },
};

// ── Radio group: RadioGroup ─────────────────────────────

const PERIODS = [
  { value: 'monthly', label: 'Monthly', description: 'Invoiced on the first' },
  { value: 'annual', label: 'Annual' },
  { value: 'legacy', label: 'Quarterly (retired)', disabled: true },
];

export const RadioLabelDescriptionAndSelection: Story = {
  render: () => (
    <Harness initialValues={{ period: 'monthly' }}>
      <RadioGroup
        name="period"
        label="Billing period"
        tooltip="How often the customer is invoiced"
        description="Applies from the next invoice."
        options={PERIODS}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Applies from the next invoice.'),
    ).toBeVisible();
    const monthly = canvas.getByRole('radio', { name: 'Monthly' });
    await expect(monthly).toBeChecked();
    await expect(monthly).toHaveAccessibleDescription('Invoiced on the first');
    await expect(
      canvas.getByRole('radio', { name: /Quarterly/ }),
    ).toBeDisabled();

    await userEvent.click(canvas.getByText('Annual'));
    await expect(readValue(canvas).period).toBe('annual');
    await expect(monthly).not.toBeChecked();
  },
};

export const RadioRequiredMarker: Story = {
  render: () => (
    <Harness>
      <RadioGroup
        name="period"
        label="Billing period"
        required
        options={PERIODS}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The control draws the label, so it draws the required asterisk too.
    await expect(
      within(canvas.getByRole('group')).getByText('*'),
    ).toBeVisible();
  },
};

export const RadioDefaultValueWhenEmpty: Story = {
  render: () => (
    <Harness>
      <RadioGroup
        name="period"
        label="Billing period"
        options={PERIODS}
        defaultValue="annual"
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Annual' })).toBeChecked();
    await userEvent.click(canvas.getByText('Monthly'));
    await expect(canvas.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Annual' }),
    ).not.toBeChecked();
  },
};

export const RadioChoicesAndHorizontal: Story = {
  render: () => (
    <Harness initialValues={{ size: 5 }}>
      <RadioGroup
        name="size"
        label="Scale"
        choices={[
          { value: 3, label: '3 point' },
          { value: 5, label: '5 point' },
          { value: 7, label: '7 point' },
        ]}
        orientation="horizontal"
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `choices` is the older name for `options`, still accepted.
    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
    await expect(canvas.getByRole('radio', { name: '5 point' })).toBeChecked();
    await userEvent.click(canvas.getByText('7 point'));
    // Numbers stay numbers: a string would not match the stored 5 or 7.
    await expect(readValue(canvas).size).toBe(7);
  },
};

export const RadioDisabledAndReadOnly: Story = {
  render: () => (
    <Harness initialValues={{ a: 'monthly', b: 'monthly' }}>
      <RadioGroup name="a" label="Disabled" options={PERIODS} disabled />
      <RadioGroup name="b" label="Read only" options={PERIODS} readOnly />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const radio of canvas.getAllByRole('radio', { name: 'Annual' })) {
      await expect(radio).toBeDisabled();
    }
    await userEvent.click(canvas.getAllByText('Annual')[0]);
    await expect(readValue(canvas)).toEqual({ a: 'monthly', b: 'monthly' });
  },
};

/** The checklist question dialog: scale length defaults to 5 and is required. */
export const RadioLikertScaleLength: Story = {
  render: () => (
    <Harness>
      <QuestionLikertFields />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: '5 point' })).toBeChecked();
    await expect(
      within(canvas.getByRole('group', { name: /Scale length/ })).getByText(
        '*',
      ),
    ).toBeVisible();
    await userEvent.click(canvas.getByText('7 point'));
    await expect(readValue(canvas).likert_scale_length).toBe(7);
  },
};

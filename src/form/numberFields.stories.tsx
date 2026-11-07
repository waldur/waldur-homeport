import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Form, FormSpy } from 'react-final-form';
import { expect, userEvent, within } from 'storybook/test';

import { Code } from 'waldur-ui';

import { parseFloatOrNull } from '@/marketplace/common/utils';

import { RangeNumberField } from './RangeNumberField';

import { NumberGroup, SliderNumberGroup } from '.';

/**
 * The react-final-form number fields, all on waldur-ui's `NumberInput`:
 * `NumberGroup` (a field with its label; `NumberField` is the bare adapter,
 * `NumberEditField` the edit-row one), `SliderNumberGroup` (a slider beside
 * the field) and `RangeNumberField` (a min-max pair, for filters).
 *
 * How the controls look on their own is on the Number input, Slider number
 * input and Range input pages. These stories cover what the form adds: the
 * stored value, validation reaching the control, and which field fits which
 * number. Never a raw `<input type="number">` or an Input with
 * `type="number"`: they skip the clamping, steppers, unit and invalid state.
 */
const meta: Meta = {
  title: 'Forms/Number/Form fields',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const required = (value: unknown) =>
  value === null || value === undefined || value === ''
    ? 'Required'
    : undefined;

const Harness = ({
  initialValues,
  children,
}: {
  initialValues: Record<string, any>;
  children: React.ReactNode;
}) => (
  <Form
    onSubmit={() => undefined}
    initialValues={initialValues}
    render={() => (
      <div className="flex max-w-xl flex-col">
        {children}
        <FormSpy subscription={{ values: true }}>
          {({ values }) => (
            <Code data-testid="form-value">{JSON.stringify(values)}</Code>
          )}
        </FormSpy>
      </div>
    )}
  />
);

const readValues = (canvas: ReturnType<typeof within>) =>
  JSON.parse(canvas.getByTestId('form-value').textContent ?? '{}');

/**
 * One field per kind of number. Parsing with `parseFloatOrNull` keeps an
 * emptied field `null` rather than 0, so `required` can tell the two apart.
 */
export const Fields: Story = {
  render: () => (
    <Harness initialValues={{ size: 40, nodes: 3, price: 0.0042, cores: 4 }}>
      <NumberGroup
        name="size"
        label="Volume size"
        description="Carets: any quantity or size."
        min={1}
        max={500}
        unit="GB"
        parse={parseFloatOrNull}
        validate={required}
        required
      />
      <NumberGroup
        name="nodes"
        label="Nodes"
        description='stepperLayout="buttons": a count picked a step at a time.'
        min={1}
        max={10}
        stepperLayout="buttons"
        parse={parseFloatOrNull}
      />
      <NumberGroup
        name="price"
        label="Price per unit"
        description="showSteppers={false}: a price, whose decimals make a step invisible."
        min={0}
        step={0.0000001}
        showSteppers={false}
        unit="EUR"
        parse={parseFloatOrNull}
      />
      <SliderNumberGroup
        name="cores"
        label="Cores"
        description="SliderNumberGroup: a value picked from a range."
        min={1}
        max={32}
        unit="Cores"
        parse={parseFloatOrNull}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // A stepper stores a number, not text.
    const plus = canvas.getAllByRole('button', { name: 'Increase value' });
    await userEvent.click(plus[1]);
    await expect(readValues(canvas).nodes).toBe(4);

    // Emptied and left: null in the form, and the required error shown.
    const size = canvas.getByLabelText(/Volume size/);
    await userEvent.clear(size);
    await userEvent.tab();
    await expect(readValues(canvas).size).toBeNull();
    await expect(size).toHaveAttribute('aria-invalid', 'true');

    // Out of range: clamped when the field is left.
    await userEvent.type(size, '900');
    await userEvent.tab();
    await expect(readValues(canvas).size).toBe(500);
  },
};

export const Disabled: Story = {
  render: () => (
    <Harness initialValues={{ size: 40, nodes: 3, cores: 4 }}>
      <NumberGroup name="size" label="Volume size" unit="GB" disabled />
      <NumberGroup
        name="nodes"
        label="Nodes"
        stepperLayout="buttons"
        disabled
      />
      <SliderNumberGroup name="cores" label="Cores" min={1} max={32} disabled />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toBeDisabled();
    }
  },
};

/** A min-max pair for a table filter; both ends optional. */
export const RangeFilter: Story = {
  render: () => (
    <Harness initialValues={{}}>
      <Field name="cost" component={RangeNumberField} />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Min'), '10');
    await userEvent.type(canvas.getByPlaceholderText('Max'), '99');
    await expect(readValues(canvas).cost).toEqual({ min: 10, max: 99 });
    await userEvent.clear(canvas.getByPlaceholderText('Min'));
    await userEvent.clear(canvas.getByPlaceholderText('Max'));
    await expect(readValues(canvas).cost).toBeUndefined();
  },
};

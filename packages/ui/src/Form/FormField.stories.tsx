import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Input } from '../Input/Input';
import { NativeSelect } from '../Input/NativeSelect';
import { Textarea } from '../Input/Textarea';

import { FormField } from './FormField';
import { FormFieldset } from './FormFieldset';
import { FormLabel } from './FormLabel';
import { FormLegend } from './FormLegend';
import { FormText } from './FormText';

const meta: Meta<typeof FormField> = {
  title: 'Forms/Layout/FormField',
  component: FormField,
  parameters: {
    docs: {
      description: {
        component:
          'A label, a control and its help or error text. A field links its `FormLabel` to its control by itself: `Input`, `Textarea`, `NativeSelect` (so also `NumberInput` and `SecretInput`), the date pickers and `Select` give themselves an id inside a field and the label points at the first, so there is no `htmlFor`, `id` or `controlId` to write. Pass `controlId` only when the id must be known. `FormText` is the 14px help line; `className="text-danger"` makes it an error. The field draws no spacing: give it the bottom margin the layout needs. In waldur-homeport\'s react-final-form forms use `FormGroup` from `@/form`, which adds the label, tooltip, description and error from a field\'s props.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-6 p-6">
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input placeholder="Project name" />
        <FormText>Shown in lists and invoices.</FormText>
      </FormField>
      <FormField>
        <FormLabel required>Email</FormLabel>
        <Input type="email" invalid defaultValue="not an email" />
        <FormText as="div" variant="danger">
          Enter a valid email address.
        </FormText>
      </FormField>
    </div>
  ),
};

/** The label names whichever control is inside. */
export const Controls: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-6 p-6">
      <FormField>
        <FormLabel>Notes</FormLabel>
        <Textarea rows={3} />
      </FormField>
      <FormField>
        <FormLabel>Currency</FormLabel>
        <NativeSelect>
          <option>EUR</option>
          <option>USD</option>
        </NativeSelect>
      </FormField>
    </div>
  ),
};

/** The colours a help line takes. */
export const HelpVariants: Story = {
  name: 'Help variants',
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-4 p-6">
      <FormText>default: help under a field.</FormText>
      <FormText variant="muted">muted: a quieter note.</FormText>
      <FormText variant="warning">warning: a caution.</FormText>
      <FormText variant="danger">danger: an error.</FormText>
    </div>
  ),
};

/** The fallback when no group fits: each control keeps a unique id; the label names the first. */
export const SeveralControls: Story = {
  name: 'Several controls',
  render: () => (
    <FormField className="flex max-w-[420px] flex-col gap-2 p-6">
      <FormLabel>Allocation range</FormLabel>
      <Input aria-describedby="range-help" placeholder="From" />
      <Input placeholder="To" />
      <FormText id="range-help">The label names the first field.</FormText>
    </FormField>
  ),
};

/**
 * Several controls under one question: a fieldset named by a legend, with each
 * control named on its own. A label cannot name two controls.
 */
export const GroupOfControls: Story = {
  name: 'Group of controls',
  render: () => (
    <FormFieldset className="flex max-w-[420px] flex-col gap-2 p-6">
      <FormLegend required>Allocation range</FormLegend>
      <FormField>
        <FormLabel>From</FormLabel>
        <Input placeholder="0" />
      </FormField>
      <FormField>
        <FormLabel>Till</FormLabel>
        <Input placeholder="100" />
      </FormField>
      <FormText>Both ends are inclusive.</FormText>
    </FormFieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: /Allocation range/ });
    await expect(group).toHaveAccessibleDescription('Both ends are inclusive.');
    // Each control has its own name, and the group's help is not repeated on them.
    await expect(canvas.getByLabelText('From')).not.toHaveAttribute(
      'aria-describedby',
    );
    await expect(canvas.getByLabelText('Till')).not.toBe(
      canvas.getByLabelText('From'),
    );
  },
};

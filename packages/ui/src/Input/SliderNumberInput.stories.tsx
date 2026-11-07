import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';

import { FormField, FormLabel } from '../Form';

import { SliderNumberInput, SliderNumberInputProps } from './SliderNumberInput';

const meta: Meta<typeof SliderNumberInput> = {
  title: 'Forms/Number/Slider number input',
  component: SliderNumberInput,
  parameters: {
    docs: {
      description: {
        component:
          "A `NumberInput` with a slider beside it, for a value picked from a range (a VM's cores, its memory). The field is the control: the label names it, the keyboard and screen readers use it, it clamps and shows the unit. The slider is a pointer shortcut that follows it, out of the tab order; an empty field leaves it at `min`. In react-final-form use `SliderNumberGroup` from `@/form`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SliderNumberInput>;

const Labelled = ({
  label,
  initial,
  ...props
}: Omit<SliderNumberInputProps, 'value' | 'onValueChange'> & {
  label: string;
  initial: number | string;
}) => {
  const [value, setValue] = useState<number | string>(initial);
  return (
    <FormField>
      <FormLabel>{label}</FormLabel>
      <SliderNumberInput value={value} onValueChange={setValue} {...props} />
    </FormField>
  );
};

export const Default: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-5 p-5">
      <Labelled label="Cores" initial={4} min={1} max={32} unit="Cores" />
      <Labelled label="Memory" initial={16} min={1} max={128} unit="GB" />
      <Labelled label="Empty" initial="" min={1} max={16} />
      <Labelled label="Disabled" initial={8} min={1} max={16} disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The label names the number field; the slider is hidden from it.
    const memory = canvas.getByLabelText('Memory');
    await expect(memory).toHaveAttribute('type', 'number');
    const sliders = canvas.getAllByRole('slider', { hidden: true });
    const memorySlider = sliders[1];
    await expect(memorySlider).toHaveAttribute('tabindex', '-1');

    // Moving the slider sets the field.
    // user-event cannot drag a range thumb.
    fireEvent.change(memorySlider, { target: { value: '64' } });
    await expect(memory).toHaveValue(64);

    // Clearing the field leaves it empty, and the slider at min.
    await userEvent.clear(memory);
    await expect(memory).toHaveValue(null);
    await expect(memorySlider).toHaveValue('1');

    // Too much is invalid until the field is left, then clamped.
    await userEvent.type(memory, '200');
    await expect(memory).toHaveAttribute('aria-invalid', 'true');
    await userEvent.tab();
    await expect(memory).toHaveValue(128);
  },
};

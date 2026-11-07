import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Form } from 'react-final-form';

import { BoxNumberField } from './BoxNumberField';

import { SliderNumberGroup } from '.';

/**
 * Number fields with minus and plus buttons: `BoxNumberField` (buttons on
 * either side of the input) and `SliderNumberField` (a slider with the
 * input and stacked buttons beside it).
 */
const meta: Meta = {
  title: 'Forms/Number steppers',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const Harness = ({ children }: { children: React.ReactNode }) => (
  <Form
    onSubmit={() => undefined}
    initialValues={{ cores: 4, ram: 16 }}
    render={() => (
      <div className="flex max-w-xl flex-col gap-5">{children}</div>
    )}
  />
);

export const BoxNumber: Story = {
  render: () => (
    <Harness>
      <Field name="cores" component={BoxNumberField} min={1} max={64} />
      <Field
        name="cores"
        component={BoxNumberField}
        min={1}
        max={64}
        disabled
      />
    </Harness>
  ),
};

export const SliderNumber: Story = {
  render: () => (
    <Harness>
      <SliderNumberGroup name="ram" label="RAM" min={1} max={128} unit="GB" />
      <SliderNumberGroup
        name="ram"
        label="RAM (disabled)"
        min={1}
        max={128}
        unit="GB"
        disabled
      />
    </Harness>
  ),
};

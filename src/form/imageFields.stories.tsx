import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Form } from 'react-final-form';
import { expect, within } from 'storybook/test';

import { ImageField } from './ImageField';
import { WideImageField } from './WideImageField';

/**
 * The image upload fields: `ImageField` (behind `ImageGroup`: category icons,
 * offering images, quick shortcuts) and `WideImageField` (avatars and logos).
 *
 * `WideImageField` shows Cancel once a file is picked or the image is added or
 * cleared, and otherwise Remove while there is an image to remove.
 */
const meta: Meta = {
  title: 'Forms/Image fields',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// Plain shapes, so the stories need no network and no image fixture.
const IMAGE =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64'/></svg>";
// A picked file: only a File, or adding or clearing the image, counts as a change.
const PICKED_FILE = new File(
  [
    "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><circle cx='32' cy='32' r='32'/></svg>",
  ],
  'avatar.svg',
  { type: 'image/svg+xml' },
);

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
    render={() => <div style={{ maxWidth: 520 }}>{children}</div>}
  />
);

export const ImageFieldEmpty: Story = {
  render: () => (
    <Harness>
      <Field name="icon" component={ImageField as any} />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /upload/i })).toBeVisible();
  },
};

export const ImageFieldWithImage: Story = {
  render: () => (
    <Harness initialValues={{ icon: IMAGE }}>
      {/* Callers hand initialValue to the field itself, not to Field. */}
      <Field
        name="icon"
        render={(field) => <ImageField {...field} initialValue={IMAGE} />}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: /replace/i }),
    ).toBeVisible();
  },
};

export const WideImageFieldEmpty: Story = {
  render: () => (
    <Harness>
      <Field
        name="image"
        component={WideImageField as any}
        alt="AB"
        size={64}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /change/i })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /cancel/i }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: /remove/i }),
    ).not.toBeInTheDocument();
  },
};

export const WideImageFieldWithImage: Story = {
  render: () => (
    <Harness initialValues={{ image: IMAGE }}>
      <Field
        name="image"
        render={(field) => (
          <WideImageField {...field} initialValue={IMAGE} size={64} />
        )}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /remove/i })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /cancel/i }),
    ).not.toBeInTheDocument();
  },
};

export const WideImageFieldChanged: Story = {
  render: () => (
    <Harness initialValues={{ image: PICKED_FILE }}>
      <Field
        name="image"
        render={(field) => (
          <WideImageField {...field} initialValue={IMAGE} size={64} />
        )}
      />
    </Harness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /remove/i }),
    ).not.toBeInTheDocument();
  },
};

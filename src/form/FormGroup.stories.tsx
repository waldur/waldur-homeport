import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'react-bootstrap';
import { expect, screen, userEvent, within } from 'storybook/test';

import { BaseButton } from 'waldur-ui';

import { FormGroup } from './FormGroup';

/**
 * `FormGroup` wraps a control with its label, description, help and error.
 * The help icon is a focusable button (`HelpIcon`), placed beside the
 * `<label>` rather than inside it: inside, it would count as one of the
 * control's labels and be announced as part of the field's name.
 */
const meta: Meta<typeof FormGroup> = {
  title: 'Forms/FormGroup',
  component: FormGroup,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FormGroup>;

/** Asserts the label names only the input, and the help is its own button. */
const expectHelpBesideLabel = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('Project name');
  await expect(input.tagName).toBe('INPUT');
  const help = canvas.getByRole('button', { name: 'Help' });
  await expect(help.closest('label')).toBeNull();
  return help;
};

/** The help icon leads the label. */
export const WithHelp: Story = {
  args: {
    label: 'Project name',
    help: 'Shown in lists and invoices.',
    required: true,
    children: <Form.Control />,
  },
  play: async ({ canvasElement }) => {
    const help = await expectHelpBesideLabel(canvasElement);
    // Keyboard users reach the explanation: tabbing onto the button shows it.
    help.focus();
    await expect(help).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Shown in lists and invoices.',
    );
  },
};

/** `tooltipEnd` moves the icon to the end of the label row. */
export const HelpAtEnd: Story = {
  args: { ...WithHelp.args, tooltipEnd: true },
  play: async ({ canvasElement }) => {
    const help = await expectHelpBesideLabel(canvasElement);
    await userEvent.tab();
    await expect(help).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  },
};

/** With a quick action, the icon and the action share the label row. */
export const WithQuickAction: Story = {
  args: {
    ...WithHelp.args,
    tooltipEnd: true,
    quickAction: (
      <BaseButton
        variant="text-secondary"
        size="sm"
        label="Reset"
        className="mb-1"
      />
    ),
  },
  play: async ({ canvasElement }) => {
    await expectHelpBesideLabel(canvasElement);
    await expect(
      within(canvasElement).getByRole('button', { name: 'Reset' }),
    ).toBeInTheDocument();
  },
};

/** No help: no extra tab stop. */
export const WithoutHelp: Story = {
  args: { label: 'Project name', children: <Form.Control /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Project name')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

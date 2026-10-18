import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';

import { Input } from 'waldur-ui';

import FormTable from './FormTable';

/**
 * `FormTable` lays out read-only details as label / value rows. A row can
 * carry a help tooltip or a warning tooltip next to its label. Both are
 * focusable buttons placed beside the `<label>`, not inside it, so the label
 * keeps naming only the control it is for.
 */
const meta: Meta<typeof FormTable> = {
  title: 'Forms/Layout/FormTable',
  component: FormTable,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof FormTable>;

export const WithTooltips: Story = {
  render: () => (
    <FormTable>
      <FormTable.Item
        label="Backend ID"
        required
        colon
        tooltip="Identifier of the resource in the backend."
        value={<Input />}
      />
      <FormTable.Item
        label="Username policy"
        colon
        warnTooltip="This option clears all usernames of the existing offering users."
        value={<Input />}
      />
      <FormTable.Item label="Plain row" value="No tooltips here" />
    </FormTable>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each label names its input and nothing else.
    // The row links them itself, so each input has an id of its own.
    const backendId = canvas.getByLabelText(/Backend ID/);
    const usernamePolicy = canvas.getByLabelText(/Username policy/);
    await expect(backendId).not.toBe(usernamePolicy);
    await expect(backendId).toHaveAttribute('id');

    const help = canvas.getByRole('button', { name: 'Help' });
    const warning = canvas.getByRole('button', { name: 'Warning' });
    await expect(help.closest('label')).toBeNull();
    await expect(warning.closest('label')).toBeNull();

    // Both explanations are reachable from the keyboard.
    help.focus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Identifier of the resource in the backend.',
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect(warning).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This option clears all usernames of the existing offering users.',
    );
    // A row without tooltips adds no tab stops.
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};

/** The row with a description puts the label in its own header cell. */
export const WithDescription: Story = {
  render: () => (
    <FormTable>
      <FormTable.Item
        label="Retention"
        description="How long backups are kept."
        tooltip="Applies to new backups only."
        value={<Input />}
      />
    </FormTable>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Retention').tagName).toBe('INPUT');
    await expect(
      canvas.getByRole('button', { name: 'Help' }).closest('label'),
    ).toBeNull();
  },
};

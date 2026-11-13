import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BaseButton, Checkbox, LinkButton, Radio, Switch } from 'waldur-ui';

/**
 * A page for an "Unavailable" offering or resource is wrapped in
 * `.disabled-view`, which dims it and takes the pointer away from its links,
 * buttons and inputs. A check control draws its label as a sibling of the
 * input, linked by `for`, so the input rule alone leaves the label text
 * clickable, and a click on it still toggles the control.
 *
 * These stories run against the real compiled stylesheet (`.disabled-view` is
 * in `src/styles/legacy/_content.scss`), so a selector that stops
 * matching the markup fails here.
 */
const meta: Meta = {
  title: 'Forms/Check controls/Disabled view',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const Controls = ({ prefix }: { prefix: string }) => {
  const [box, setBox] = useState(false);
  const [on, setOn] = useState(false);
  const [choice, setChoice] = useState('a');
  return (
    <div className="flex flex-col gap-2.5" data-testid={prefix}>
      <Checkbox
        label={`${prefix} checkbox`}
        checked={box}
        onCheckedChange={setBox}
      />
      <Switch label={`${prefix} switch`} checked={on} onCheckedChange={setOn} />
      <Radio
        label={`${prefix} radio A`}
        name={prefix}
        checked={choice === 'a'}
        onChange={() => setChoice('a')}
      />
      <Radio
        label={`${prefix} radio B`}
        name={prefix}
        checked={choice === 'b'}
        onChange={() => setChoice('b')}
      />
    </div>
  );
};

const Page = () => (
  <div className="max-w-90">
    <div className="disabled-view">
      <Controls prefix="Unavailable" />
    </div>
    <hr />
    <Controls prefix="Available" />
  </div>
);

const LABELS = ['checkbox', 'switch', 'radio B'];

export const LabelsDoNotToggleInADisabledView: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unavailable = within(canvas.getByTestId('Unavailable'));
    const available = within(canvas.getByTestId('Available'));

    // The theme stylesheet is swapped in after the first render.
    await waitFor(
      () =>
        expect(
          getComputedStyle(unavailable.getByText('Unavailable checkbox'))
            .pointerEvents,
        ).toBe('none'),
      { timeout: 15000 },
    );

    for (const name of LABELS) {
      const label = unavailable.getByText(`Unavailable ${name}`);
      const control = unavailable.getByLabelText(`Unavailable ${name}`);
      await expect(getComputedStyle(label).cursor).toBe('not-allowed');
      await expect(getComputedStyle(control).pointerEvents).toBe('none');
      // The pointer cannot land on the label, so the click is refused rather
      // than reaching the control.
      await expect(userEvent.click(label)).rejects.toThrow(/pointer-events/);
      await expect(control).not.toBeChecked();
    }
    await expect(
      unavailable.getByLabelText('Unavailable radio A'),
    ).toBeChecked();

    // The same controls outside the wrapper still work, so the refusal above
    // comes from `.disabled-view` and not from the test.
    for (const name of LABELS) {
      await userEvent.click(available.getByText(`Available ${name}`));
      await expect(available.getByLabelText(`Available ${name}`)).toBeChecked();
    }
  },
};

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/**
 * Only a control with a fill of its own takes the disabled fill. An inline
 * control (a LinkButton, a bare icon button such as a table's Pin column, a
 * text-variant button) stays transparent, as it is when disabled outside the
 * view, instead of growing a grey box.
 */
export const OnlyFilledControlsTakeTheDisabledFill: Story = {
  render: () => (
    <div className="disabled-view flex items-center gap-4">
      <BaseButton variant="primary" label="Filled" />
      <BaseButton variant="text-secondary" label="Text" />
      <LinkButton>Inline link</LinkButton>
      <button
        type="button"
        className="bg-transparent border-0 p-0 m-0 cursor-pointer"
      >
        Bare
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = (name: string) =>
      getComputedStyle(canvas.getByRole('button', { name }));
    const bg = (name: string) => style(name).backgroundColor;

    // The theme stylesheet is swapped in after the first render.
    await waitFor(() => expect(style('Bare').pointerEvents).toBe('none'), {
      timeout: 15000,
    });
    await expect(bg('Filled')).not.toBe(TRANSPARENT);
    for (const name of ['Text', 'Inline link', 'Bare']) {
      await expect(bg(name)).toBe(TRANSPARENT);
    }
  },
};

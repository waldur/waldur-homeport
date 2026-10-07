import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Checkbox, Radio, Switch } from 'waldur-ui';

/**
 * A page for an "Unavailable" offering or resource is wrapped in
 * `.disabled-view`, which dims it and takes the pointer away from its links,
 * buttons and inputs. A check control draws its label as a sibling of the
 * input, linked by `for`, so the input rule alone leaves the label text
 * clickable, and a click on it still toggles the control.
 *
 * These stories run against the real compiled stylesheet (`.disabled-view` is
 * in `src/metronic/sass/custom/_content.scss`), so a selector that stops
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
    <div className="d-flex flex-column gap-3" data-testid={prefix}>
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
  <div style={{ maxWidth: 360 }}>
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

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, within } from 'storybook/test';

import { MiddleTruncate } from './MiddleTruncate';

const LONG = 'Quantum Error Correction Simulations (Create)';

const meta: Meta<typeof MiddleTruncate> = {
  title: 'Data Display/MiddleTruncate',
  component: MiddleTruncate,
  parameters: {
    docs: {
      description: {
        component:
          'Truncates the middle of a string ("start…end") with CSS alone: the head shrinks with an ellipsis while the last `tailLength` characters stay pinned, so a meaningful suffix (an id, a "(Create)" marker) stays readable. The full text shows whenever it fits. It needs a width-constrained flex parent with `min-w-0`; screen readers get the whole string once. The current crumb of a BreadcrumbTrail uses it. See docs/breadcrumbs.md.',
      },
    },
  },
  args: { text: LONG },
};
export default meta;

type Story = StoryObj<typeof MiddleTruncate>;

// A width-constrained flex row, which is what lets the head clip.
const Frame = ({ width, children }: { width: number; children: ReactNode }) => (
  <div
    className="flex min-w-0 border-[1px] border-dashed border-secondary p-1 text-sm"
    style={{ width }}
  >
    {children}
  </div>
);

const isClipped = (element: HTMLElement) =>
  element.scrollWidth > element.clientWidth;

/** Room to spare: the whole string, nothing clipped. */
export const Fits: Story = {
  render: (args) => (
    <Frame width={480}>
      <MiddleTruncate {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(isClipped(canvas.getByTestId('middle-truncate-head'))).toBe(
      false,
    );
  },
};

/** Too narrow: the head ellipsises, the tail stays whole. */
export const Narrow: Story = {
  render: (args) => (
    <Frame width={180}>
      <MiddleTruncate {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(isClipped(canvas.getByTestId('middle-truncate-head'))).toBe(
      true,
    );
    const tail = canvas.getByTestId('middle-truncate-tail');
    await expect(tail).toHaveTextContent('s (Create)');
    await expect(isClipped(tail)).toBe(false);
    // Announced once, whole, not as two fragments.
    await expect(canvas.getByText(LONG)).toHaveClass('sr-only');
  },
};

/** A short string is one span with an end ellipsis, not a head/tail split. */
export const Short: Story = {
  args: { text: 'Project Alpha' },
  render: (args) => (
    <Frame width={70}>
      <MiddleTruncate {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('middle-truncate-whole')).toHaveTextContent(
      'Project Alpha',
    );
    await expect(
      canvas.queryByTestId('middle-truncate-head'),
    ).not.toBeInTheDocument();
  },
};

/**
 * The split lands on a space: it is pinned to the head as a non-breaking
 * one, so the words don't run together ("…CorrectionSimulations").
 */
export const SplitOnSpace: Story = {
  args: { text: 'Quantum Error Correction Simulations', tailLength: 11 },
  render: (args) => (
    <Frame width={480}>
      <MiddleTruncate {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByTestId('middle-truncate-head').textContent,
    ).toMatch(/Correction\u00A0$/);
    await expect(canvas.getByTestId('middle-truncate-tail')).toHaveTextContent(
      /^Simulations$/,
    );
  },
};

/** `tailLength` sets how much of the end stays pinned. */
export const LongerTail: Story = {
  args: { text: 'vm-2026-10-19-backup-worker-0042', tailLength: 18 },
  render: (args) => (
    <Frame width={200}>
      <MiddleTruncate {...args} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('middle-truncate-tail')).toHaveTextContent(
      '19-backup-worker-0042'.slice(-18),
    );
  },
};

/** Drag the corner to see the middle collapse and come back. */
export const Resizable: Story = {
  render: (args) => (
    <div className="flex min-w-0 w-[360px] resize-x overflow-hidden border-[1px] border-dashed border-secondary p-1 text-sm">
      <MiddleTruncate {...args} />
    </div>
  ),
};

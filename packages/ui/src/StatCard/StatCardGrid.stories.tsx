import { WarningCircleIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Badge } from '../Badge';

import { StatCardGrid, type StatCardGridItem } from './StatCardGrid';

const meta: Meta<typeof StatCardGrid> = {
  title: 'Data Display/StatCardGrid',
  component: StatCardGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component: `A row of \`StatCard\`s built from an array: each item's \`label\`, \`value\`, \`footer\`, \`icon\` and \`tone\` go straight to its tile (see the StatCard page for what each slot is for).

The column count follows the number of tiles (one column on phones):
- **2–3 tiles** — one row from \`sm\`.
- **4–6 tiles** — two to a row from \`sm\`, all on one row from \`lg\`.
- **7 or more** — six to a row from \`lg\`, wrapping.

Reach for it whenever a page shows a plain list of figures; \`size="sm"\` makes every tile compact, for a dense grid inside another card. Lay \`StatCard\`s out by hand only when the columns must follow a container rather than the viewport (\`@container\` queries, as in a card that sits in a narrow form column).

It has a 16px bottom margin. \`spaceless\` drops it when what follows brings its own spacing; \`className\` adds to the grid (a different margin, say).`,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof StatCardGrid>;

const story = (text: string) => ({ docs: { description: { story: text } } });

const STATS: StatCardGridItem[] = [
  { label: 'Projects', value: 14 },
  { label: 'Resources', value: 128, footer: '+12 this month' },
  { label: 'Members', value: 37 },
  { label: 'Open issues', value: 5 },
  { label: 'Pending orders', value: 2 },
  { label: 'Invoices', value: 9 },
  { label: 'Credits', value: '€12,000' },
];

/* ------------------------------------------------------------------------ */
/* Columns                                                                  */
/* ------------------------------------------------------------------------ */

export const Two: Story = {
  name: 'Columns: two',
  parameters: story('Two tiles split the row in halves.'),
  args: { stats: STATS.slice(0, 2) },
};

export const Four: Story = {
  name: 'Columns: four',
  parameters: story(
    'Four or more tiles go two to a row on a tablet and share one row from `lg`.',
  ),
  args: { stats: STATS.slice(0, 4) },
};

export const Five: Story = {
  name: 'Columns: five',
  parameters: story(
    'Keep labels and values short when five or six share a row.',
  ),
  args: { stats: STATS.slice(0, 5) },
};

export const Seven: Story = {
  name: 'Columns: seven or more',
  parameters: story(
    'Seven or more wrap six to a row. Seven leaves one tile alone on the second row, so prefer six or fewer, or combine two figures into one tile.',
  ),
  args: { stats: STATS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByTestId('stat-card-value')).toHaveLength(7);
  },
};

/* ------------------------------------------------------------------------ */
/* Items                                                                    */
/* ------------------------------------------------------------------------ */

export const RichItems: Story = {
  name: 'Items: footer, icon and tone',
  parameters: story(
    'Every StatCard slot except `size` is available per item. Footers line up along the bottom of the row even when only some tiles have one.',
  ),
  args: {
    stats: [
      {
        label: 'Active users',
        value: 512,
        footer: (
          <>
            <Badge variant="success" shape="pill" tone="outline">
              +24
            </Badge>
            in the last 3 months
          </>
        ),
      },
      { label: 'Tables monitored', value: 48 },
      {
        label: 'Active alerts',
        value: 3,
        tone: 'danger',
        icon: (
          <WarningCircleIcon size={20} weight="bold" className="text-danger" />
        ),
      },
      {
        label: 'Thresholds (weekly / monthly)',
        value: '10% / 25%',
      },
    ],
  },
};

export const Small: Story = {
  name: 'Items: size sm',
  parameters: story(
    '`size="sm"` passes to every tile: the compact tile for a dense grid of figures, usually inside another card and with `spaceless`.',
  ),
  args: {
    size: 'sm',
    spaceless: true,
    stats: [
      { label: 'Completed', value: 22 },
      { label: 'Failed', value: 8 },
      { label: 'Timed out', value: 2 },
      { label: 'Canceled', value: 1 },
      { label: 'Running / pending', value: '1 / 3' },
      { label: 'CPU-hours', value: '1,798' },
    ],
  },
};

/* ------------------------------------------------------------------------ */
/* Spacing                                                                  */
/* ------------------------------------------------------------------------ */

export const Spaceless: Story = {
  name: 'Spacing: spaceless',
  parameters: story(
    '`spaceless` drops the bottom margin, for a grid followed by something with its own top spacing, or one given a different margin through `className`.',
  ),
  render: () => (
    <>
      <StatCardGrid stats={STATS.slice(0, 3)} spaceless />
      <div className="mt-6 text-sm text-tertiary">
        Content with its own top margin.
      </div>
    </>
  ),
};

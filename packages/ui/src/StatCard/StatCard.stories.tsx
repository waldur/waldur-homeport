import {
  ArrowUpIcon,
  CubeIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FC, ReactNode } from 'react';
import { expect, within } from 'storybook/test';

import { Badge } from '../Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { HelpIcon } from '../HelpIcon';

import { StatCard, type StatCardProps } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Data Display/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component: `One figure in a bordered tile: a label, the value under it, and an optional footer row. It is the only KPI tile in HomePort; a row of them is \`StatCardGrid\` (see its own page), which picks the column count from the number of tiles and passes each stat's props straight through.

Slots:
- **label** — what the figure is. Keep it short; the unit goes here or in the value, not both.
- **value** — the figure, already formatted (\`formatCurrency\`, \`toLocaleString\`, …). A unit in a smaller \`<span>\` is fine.
- **footer** — one row under the value: a caption, a delta \`Badge\`, or a badge and a caption together. Plain text in it is muted; a Badge keeps its own colours.
- **link** — the list behind the figure, as data (\`{ to, params?, label? }\`). The tile draws "View all" at the end of the footer row, through the app's \`LinkProvider\` (HomePort's turns \`to\` into a UI-Router state link; without a provider it is a plain href), and names it after the tile: "View all Organizations".
- **icon** — top-right corner, naming what the figure measures or explaining how it is worked out (\`HelpIcon\`).

Pick the size by the grid:
- **md** (default) — four to six to a row on a page or a dashboard.
- **sm** — dense grids of many figures, often inside another card (an HPC job's figures).

\`tone\` colours the value when the figure itself is a verdict (no alerts, over budget). Colour is never the only signal: say it in the label, the footer or an icon too.

The tile fills its grid cell and the value grows, so footers line up along the bottom of a row. The value carries \`data-testid="stat-card-value"\`, so a test reads a row of figures in order.

**Pick something else when** the figure has a chart under it (\`WidgetCard\`), or the block is label/value pairs about one object (\`PropertyList\` / \`PropertyCard\`).`,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof StatCard>;

const story = (text: string) => ({ docs: { description: { story: text } } });

const Section: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-6 last:mb-0">
    <h4 className="mb-2 text-sm font-semibold text-secondary">{title}</h4>
    {children}
  </section>
);

const Delta: FC<{ children: ReactNode }> = ({ children }) => (
  <Badge
    variant="success"
    leftIcon={<ArrowUpIcon weight="bold" />}
    shape="pill"
    tone="outline"
  >
    {children}
  </Badge>
);

/* ------------------------------------------------------------------------ */
/* Playground                                                               */
/* ------------------------------------------------------------------------ */

type PlaygroundArgs = Pick<
  StatCardProps,
  'label' | 'value' | 'tone' | 'size'
> & {
  footer: string;
  withIcon: boolean;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: story(
    'One tile with its props as Controls, beside two fixed tiles so size and tone read in a row. The footer is plain text here; see the stories below for richer footers.',
  ),
  argTypes: {
    tone: {
      control: 'radio',
      options: [undefined, 'success', 'warning', 'danger'],
    },
    size: { control: 'radio', options: ['md', 'sm'] },
    value: { control: 'text' },
  },
  args: {
    label: 'Active resources',
    value: '1,204',
    footer: 'across 38 projects',
    tone: undefined,
    size: 'md',
    withIcon: false,
  },
  render: ({ footer, withIcon, size, ...args }) => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard size={size} label="Organizations" value={42} />
      <StatCard
        {...args}
        size={size}
        footer={footer || undefined}
        icon={
          withIcon ? (
            <CubeIcon size={20} weight="bold" className="text-quaternary" />
          ) : undefined
        }
      />
      <StatCard size={size} label="Projects" value={318} footer="this year" />
    </div>
  ),
};

/* ------------------------------------------------------------------------ */
/* Slots                                                                    */
/* ------------------------------------------------------------------------ */

export const Default: Story = {
  name: 'Label and value',
  parameters: story(
    'The bare tile: a label and a formatted figure. A unit can sit in a smaller span beside the value.',
  ),
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Projects" value={14} />
      <StatCard label="Invoice due" value="€4,284.50" />
      <StatCard
        label="CPU used this month"
        value={
          <>
            1,798
            <span className="ms-1 text-xl font-medium">core-h</span>
          </>
        }
      />
    </div>
  ),
};

export const Footers: Story = {
  name: 'Footer',
  parameters: story(
    'The footer row takes a caption, a delta badge, or a badge with a caption.',
  ),
  render: () => (
    <div className="grid grid-cols-4 gap-3">
      <StatCard label="Invoice due" value="€4,284" footer="pays May 30" />
      <StatCard label="Users" value={512} footer={<Delta>12%</Delta>} />
      <StatCard
        label="Active projects"
        value={318}
        footer={
          <>
            <Delta>+9</Delta>
            added in the last 3 months
          </>
        }
      />
      <StatCard label="Members" value={37} footer="across projects" />
    </div>
  ),
};

export const Link: Story = {
  parameters: story(
    '`link` leads to the list behind the figure. "View all" sits at the end of the footer row, beside a caption if there is one, and its accessible name adds the tile\'s label, so a row of them reads as distinct links. `label` changes the text. Without a `LinkProvider`, as here, `to` is a plain href.',
  ),
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Open issues" value={7} link={{ to: '#issues' }} />
      <StatCard
        label="Closed issues (this month)"
        value={42}
        footer="up from 35"
        link={{ to: '#closed' }}
      />
      <StatCard
        label="Pending reviews"
        value={3}
        link={{ to: '#reviews', label: 'Review now' }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'View all Open issues' }),
    ).toHaveAttribute('href', '#issues');
    await expect(
      canvas.getByRole('link', { name: 'Review now Pending reviews' }),
    ).toBeInTheDocument();
  },
};

export const Icon: Story = {
  parameters: story(
    '`icon` sits in the top-right corner. Use it to say how the figure is worked out (`HelpIcon`, which takes keyboard focus), or to name what it measures.',
  ),
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Average daily draw"
        value="€12.40"
        footer="€372 drawn last month ÷ 30 days"
        icon={
          <HelpIcon label="Last month's draw spread over 30 days: the rate every run-out date on this page is projected from." />
        }
      />
      <StatCard
        label="Resources"
        value="1,204"
        icon={<CubeIcon size={20} weight="bold" className="text-quaternary" />}
      />
    </div>
  ),
};

export const Tones: Story = {
  name: 'Tone',
  parameters: story(
    '`tone` colours the value when the figure is a verdict. Pair it with an icon or wording, so it does not rely on colour alone.',
  ),
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Active alerts"
        value={0}
        tone="success"
        footer="all tables within thresholds"
      />
      <StatCard
        label="Idle share"
        value="41%"
        tone="warning"
        footer="over the 30% flag"
        icon={
          <WarningCircleIcon size={20} weight="fill" className="text-warning" />
        }
      />
      <StatCard
        label="Active alerts"
        value={3}
        tone="danger"
        icon={
          <WarningCircleIcon size={20} weight="bold" className="text-danger" />
        }
      />
    </div>
  ),
};

/* ------------------------------------------------------------------------ */
/* Sizes and layout                                                         */
/* ------------------------------------------------------------------------ */

export const Small: Story = {
  name: 'Size: sm',
  parameters: story(
    'The compact tile for dense grids, often inside another card: smaller padding, an 18px value that wraps rather than overflowing, and a 12px label and footer.',
  ),
  render: () => (
    <Card bordered>
      <CardHeader>
        <CardTitle>Job 4821 · performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-6 gap-4">
          <StatCard size="sm" label="Completed" value={22} />
          <StatCard size="sm" label="Failed" value={8} />
          <StatCard size="sm" label="Timed out" value={2} />
          <StatCard
            size="sm"
            label="Idle share"
            value="41%"
            footer="Samples with every GPU under 5%"
            tone="warning"
          />
          <StatCard size="sm" label="Running / pending" value="1 / 3" />
          <StatCard size="sm" label="CPU-hours" value="1,798" />
        </div>
      </CardContent>
    </Card>
  ),
};

export const Row: Story = {
  name: 'Layout: a row of tiles',
  parameters: story(
    'Tiles fill their grid cell and the value grows, so footers line up along the bottom even when only some tiles have one. `StatCardGrid` builds this grid from an array of stats.',
  ),
  render: () => (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        label="Projects"
        value={12}
        footer={
          <>
            <Delta>+2</Delta>
            this quarter
          </>
        }
      />
      <StatCard label="Members" value={48} />
      <StatCard label="Invoice due" value="€4,284" footer="pays May 30" />
      <StatCard label="Quota health" value="Good" footer="all under 80%" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const values = canvas
      .getAllByTestId('stat-card-value')
      .map((node) => node.textContent);
    await expect(values).toEqual(['12', '48', '€4,284', 'Good']);
  },
};

export const Wrapping: Story = {
  name: 'Layout: long values',
  parameters: story(
    'A `sm` value breaks rather than overflowing a narrow tile. At `md`, keep values short (format big numbers, move detail to the footer) or give the row fewer columns.',
  ),
  render: () => (
    <>
      <Section title="sm">
        <div className="grid max-w-md grid-cols-3 gap-4">
          <StatCard
            size="sm"
            label="Partition gpu-a100"
            value="12 of 16 idle"
            footer="3 busy, 1 unavailable, load 0.42"
          />
          <StatCard size="sm" label="Runs out" value="2026-12-14" />
          <StatCard
            size="sm"
            label="Allocation period"
            value="until 2027-03-31"
            footer="since 2026-04-01"
          />
        </div>
      </Section>
      <Section title="md">
        <div className="grid max-w-md grid-cols-2 gap-3">
          <StatCard label="Total credits awarded" value="€1,250,000" />
          <StatCard label="Remaining" value="€482,113" footer="38.6% left" />
        </div>
      </Section>
    </>
  ),
};

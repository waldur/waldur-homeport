import { ArrowsClockwiseIcon, PlusIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FC, ReactNode } from 'react';
import { expect, within } from 'storybook/test';

import { Badge } from '../Badge';
import { BaseButton } from '../Button';
import { PropertyItem, PropertyList } from '../PropertyList';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from './Card';

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardToolbar,
    CardDescription,
    CardContent,
    CardFooter,
  },
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component: `A surface that groups one subject: a header with its title and actions, a body, and an optional footer. It draws what HomePort's Metronic \`.card\` drew, so a page can mix the two without a seam.

**Anatomy.** \`Card\` > \`CardHeader\` (> \`CardTitle\`, \`CardToolbar\`) > \`CardContent\` > \`CardFooter\`. Every part is a plain element you can pass a \`className\` to; a utility you pass wins over the part's own styles. Each part sets \`data-slot\` (\`card\`, \`card-header\`, \`card-title\`, \`card-toolbar\`, \`card-content\`, \`card-footer\`), so a parent or a test can find it.

**What the parts draw.**
- \`Card\` — a flex column on \`--bg-primary\`, 8px radius. Light: a soft shadow, no border; dark: a 1px border. \`bordered\` draws the border in both themes, without the shadow.
- \`CardHeader\` — a 70px wrapping row with a bottom rule, inset by the card's padding. Text right in it is 14px bold \`--text-secondary\`; set \`font-normal text-primary text-[length:inherit]\` on it when the header holds controls or links that should read as page text.
- \`CardTitle\` — 1.275rem medium \`--text-primary\`, an \`h3\` by default. \`as\` keeps another element (a \`div\` around an \`h3\` and a \`small\`, an \`h5\`) with its own line height. \`size="lg"\` is the 1.385rem semibold section title.
- \`CardToolbar\` — the header's actions, a wrapping row.
- \`CardDescription\` — secondary text under a title.
- \`CardContent\` — the body, with the card's padding. \`CardFooter\` — a block with a top rule (add \`flex\` for a row of buttons).

**Variants.** \`variant="solid"\` gives the header a full-width \`--bg-secondary\` strip (expanded-row details); \`size="sm"\` is the compact card; \`variant="widget"\` pads its body 20px (dashboard widgets). \`variant="table"\` is the card \`@/table\` draws around a table — use \`Table\`, not this prop. \`asChild\` draws the card on its only child, such as a link.

**Pick something else when** the card is label/value pairs about one object (\`PropertyCard\`), one figure (\`StatCard\`), a collapsible section (\`AccordionCard\`) or a list of records (\`@/table\`'s \`Table\`). Never write Bootstrap's \`card\`, \`card-header\`, \`card-body\` classes: they no longer style anything.

**Context.** A card in a table or an expanded table row is restyled by HomePort's stylesheet through \`--card-*\` hooks the parts read. *Data Display/Card/Context* shows those cases and checks them.`,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

const story = (text: string) => ({ docs: { description: { story: text } } });

const Frame: FC<{ children: ReactNode; wide?: boolean }> = ({
  children,
  wide,
}) => (
  <div
    className={
      wide
        ? 'grid grid-cols-1 gap-5 bg-[var(--page-bg)] p-5 md:grid-cols-2'
        : 'max-w-xl bg-[var(--page-bg)] p-5'
    }
  >
    {children}
  </div>
);

const Specs = () => (
  <PropertyList variant="summary">
    <PropertyItem label="Flavor" value="m1.medium (2 vCPU, 4 GB RAM)" />
    <PropertyItem label="Storage" value="40 GB NVMe" />
    <PropertyItem
      label="State"
      value={
        <Badge variant="success" shape="pill" tone="outline" hasBullet>
          Running
        </Badge>
      }
    />
  </PropertyList>
);

const Refresh = () => (
  <BaseButton
    variant="tertiary"
    size="sm"
    tooltip="Refresh"
    iconNode={<ArrowsClockwiseIcon weight="bold" />}
  />
);

/* ------------------------------------------------------------------------ */
/* Playground                                                               */
/* ------------------------------------------------------------------------ */

type PlaygroundArgs = {
  bordered: boolean;
  variant: 'default' | 'solid' | 'widget';
  size: 'md' | 'sm';
  header: boolean;
  toolbar: boolean;
  footer: boolean;
  title: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: story(
    'The card and its parts as Controls. Turn the header, toolbar and footer on and off, and switch the variant and size to see what each changes.',
  ),
  argTypes: {
    variant: { control: 'radio', options: ['default', 'solid', 'widget'] },
    size: { control: 'radio', options: ['md', 'sm'] },
  },
  args: {
    bordered: true,
    variant: 'default',
    size: 'md',
    header: true,
    toolbar: true,
    footer: false,
    title: 'Virtual machine',
  },
  render: ({ bordered, variant, size, header, toolbar, footer, title }) => (
    <Frame>
      <Card
        bordered={bordered}
        variant={variant === 'default' ? undefined : variant}
        size={size === 'md' ? undefined : size}
      >
        {header && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {toolbar && (
              <CardToolbar className="gap-2">
                <Refresh />
                <BaseButton variant="tertiary" size="sm" label="Edit" />
              </CardToolbar>
            )}
          </CardHeader>
        )}
        <CardContent>
          <Specs />
        </CardContent>
        {footer && (
          <CardFooter className="flex justify-end gap-2">
            <BaseButton variant="tertiary" label="Cancel" />
            <BaseButton variant="primary" label="Save" />
          </CardFooter>
        )}
      </Card>
    </Frame>
  ),
};

/* ------------------------------------------------------------------------ */
/* Anatomy and surfaces                                                     */
/* ------------------------------------------------------------------------ */

export const Anatomy: Story = {
  parameters: story(
    'Every part: a header with a title (and a description under it) and a toolbar, a body, and a footer. The title is a `div` here because it holds the heading and the description in a column.',
  ),
  render: () => (
    <Frame>
      <Card bordered>
        <CardHeader>
          <CardTitle as="div" className="flex-col items-start justify-center">
            <h3 className="m-0">Virtual machine</h3>
            <CardDescription>Deployed 3 days ago in Tartu</CardDescription>
          </CardTitle>
          <CardToolbar className="gap-2">
            <Refresh />
            <BaseButton variant="tertiary" size="sm" label="Console" />
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <Specs />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <BaseButton variant="tertiary" label="Stop" />
          <BaseButton variant="primary" label="Restart" />
        </CardFooter>
      </Card>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const slots = [
      'card',
      'card-header',
      'card-title',
      'card-toolbar',
      'card-content',
      'card-footer',
    ];
    for (const slot of slots) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`),
        slot,
      ).not.toBeNull();
    }
  },
};

export const DefaultAndBordered: Story = {
  parameters: story(
    'The default card lifts off the page with a shadow in light mode and draws a border in dark mode. `bordered` draws the border in both themes, without the shadow: use it for cards inside another surface (a tab, a dialog, an expanded row) and in dense grids.',
  ),
  render: () => (
    <Frame wide>
      <Card data-testid="default">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>Shadow in light, border in dark.</CardContent>
      </Card>
      <Card bordered data-testid="bordered">
        <CardHeader>
          <CardTitle>Bordered</CardTitle>
        </CardHeader>
        <CardContent>Border in both themes.</CardContent>
      </Card>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const bordered = canvasElement.querySelector('[data-testid="bordered"]');
    await expect(getComputedStyle(bordered as Element).borderTopWidth).toBe(
      '1px',
    );
  },
};

export const BodyOnly: Story = {
  parameters: story(
    'A card without a header is just a padded surface, for a short note or a block of controls.',
  ),
  render: () => (
    <Frame>
      <Card bordered>
        <CardContent className="text-sm text-secondary">
          Backups run every night at 02:00 and are kept for 14 days.
        </CardContent>
      </Card>
    </Frame>
  ),
};

/* ------------------------------------------------------------------------ */
/* Variants                                                                 */
/* ------------------------------------------------------------------------ */

export const Solid: Story = {
  parameters: story(
    '`variant="solid"`: the header is a full-width `--bg-secondary` strip, 48px high, and the card clips its content to its corners. Used for the details of a row in an expanded table row.',
  ),
  render: () => (
    <Frame>
      <Card bordered variant="solid">
        <CardHeader>
          <h6 className="m-0 font-medium">Content</h6>
        </CardHeader>
        <CardContent className="text-sm">
          The terms of service every user accepts before their first login.
        </CardContent>
      </Card>
    </Frame>
  ),
};

export const Compact: Story = {
  parameters: story(
    '`size="sm"`: a 36px header and 16px insets, for small summary cards beside a form.',
  ),
  render: () => (
    <Frame>
      <Card bordered size="sm" className="bg-secondary">
        <CardHeader>
          <CardTitle as="h6" className="text-sm text-secondary">
            Total cluster resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyList variant="summary">
            <PropertyItem label="Nodes" value="6" />
            <PropertyItem label="vCPU" value="48" />
            <PropertyItem label="RAM" value="192 GB" />
          </PropertyList>
        </CardContent>
      </Card>
    </Frame>
  ),
};

export const Widget: Story = {
  parameters: story(
    '`variant="widget"`: a dashboard widget. Its body has 20px padding on every side.',
  ),
  render: () => (
    <Frame>
      <Card bordered variant="widget">
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-sm text-quaternary">Active projects</div>
            <div className="text-2xl font-semibold text-primary">24</div>
          </div>
          <BaseButton
            variant="tertiary"
            size="sm"
            tooltip="Add project"
            iconNode={<PlusIcon weight="bold" />}
          />
        </CardContent>
      </Card>
    </Frame>
  ),
};

/* ------------------------------------------------------------------------ */
/* Header and title                                                         */
/* ------------------------------------------------------------------------ */

export const TitleElements: Story = {
  parameters: story(
    '`CardTitle` is an `h3` by default. `as` keeps another element with its own line height: an `h4` for a subsection, or a `div` that holds a heading. `size="lg"` is the 1.385rem semibold section title (a fixed size, unlike an `h3` inside a title, which follows the reboot\'s responsive size below 1200px).',
  ),
  render: () => (
    <Frame wide>
      <Card bordered>
        <CardHeader>
          <CardTitle>Default (h3)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-quaternary">
          1.275rem medium, line height 1.2.
        </CardContent>
      </Card>
      <Card bordered>
        <CardHeader>
          <CardTitle as="h4">as=&quot;h4&quot;</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-quaternary">
          The same size, as a subsection heading.
        </CardContent>
      </Card>
      <Card bordered>
        <CardHeader>
          <CardTitle as="div">
            <h3 className="m-0">A heading inside a div</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-quaternary">
          The heading keeps its own size and weight.
        </CardContent>
      </Card>
      <Card bordered>
        <CardHeader>
          <CardTitle size="lg">size=&quot;lg&quot;</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-quaternary">
          1.385rem semibold, a page section.
        </CardContent>
      </Card>
    </Frame>
  ),
};

export const HeaderText: Story = {
  parameters: story(
    'Text placed right in `CardHeader` is 14px bold `--text-secondary`, as a label above the body. A header that holds inputs, switches or links should read as page text: set `font-normal text-primary text-[length:inherit]` on it.',
  ),
  render: () => (
    <Frame wide>
      <Card bordered>
        <CardHeader>Recent activity</CardHeader>
        <CardContent className="text-sm">Nothing yet.</CardContent>
      </Card>
      <Card bordered>
        <CardHeader className="font-normal text-primary text-[length:inherit]">
          <CardTitle>Settings</CardTitle>
          <span className="text-sm">
            Showing <strong>12</strong> of 40
          </span>
        </CardHeader>
        <CardContent className="text-sm">…</CardContent>
      </Card>
    </Frame>
  ),
};

export const FooterActions: Story = {
  parameters: story(
    '`CardFooter` is a block with a top rule, so lay out a row of buttons yourself (`flex justify-end gap-2`).',
  ),
  render: () => (
    <Frame>
      <Card bordered>
        <CardHeader>
          <CardTitle>Delete project</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          The project and its 3 resources will be removed. This cannot be
          undone.
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <BaseButton variant="tertiary" label="Cancel" />
          <BaseButton variant="danger" label="Delete" />
        </CardFooter>
      </Card>
    </Frame>
  ),
};

/* ------------------------------------------------------------------------ */
/* Composition                                                              */
/* ------------------------------------------------------------------------ */

export const AsLink: Story = {
  parameters: story(
    '`asChild` draws the card on its only child, so a whole card can be a link (category tiles, dashboard shortcuts) without a wrapping `div`.',
  ),
  render: () => (
    <Frame>
      <Card asChild bordered className="hover:border-brand">
        <a href="#marketplace" className="no-underline">
          <CardContent>
            <div className="text-base font-medium text-primary">
              Virtual machines
            </div>
            <div className="text-sm text-quaternary">14 offerings</div>
          </CardContent>
        </a>
      </Card>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('data-slot', 'card');
  },
};

export const CallerOverrides: Story = {
  parameters: story(
    "A utility you pass replaces the part's own: here the body loses its padding so a full-bleed list runs edge to edge, and the header is shorter.",
  ),
  render: () => (
    <Frame>
      <Card bordered>
        <CardHeader className="min-h-12">
          <CardTitle as="h5">Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0" data-testid="flush-body">
          <ul className="m-0 list-none p-0">
            {['Ada Lovelace', 'Alan Turing', 'Grace Hopper'].map((name) => (
              <li
                key={name}
                className="border-b border-secondary px-5 py-3 text-sm last:border-b-0"
              >
                {name}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const body = canvasElement.querySelector('[data-testid="flush-body"]');
    await expect(getComputedStyle(body as Element).paddingTop).toBe('0px');
  },
};

import { EnvelopeSimpleIcon, LinkSimpleIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SegmentedControl } from './SegmentedControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Actions/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          'Mutually exclusive options that change what a view shows (a lens), built on Radix ToggleGroup: a radiogroup with a roving tabindex. Use tabs with panels when each option owns a region of the page.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

const LENSES = [
  { value: 'requests', label: 'By request' },
  { value: 'resources', label: 'By resource' },
] as const;

export const Interactive: Story = {
  render: () => {
    const [view, setView] = useState<string>('requests');
    return (
      <div className="flex items-center gap-4 p-6">
        <SegmentedControl
          aria-label="Group by"
          options={LENSES}
          value={view}
          onValueChange={setView}
        />
        <span className="text-sm text-[var(--surface-text-secondary)]">
          {view}
        </span>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [view, setView] = useState<string>('requests');
    return (
      <div className="flex flex-col items-start gap-4 p-6">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <SegmentedControl
            key={size}
            aria-label={`Group by (${size})`}
            size={size}
            options={LENSES}
            value={view}
            onValueChange={setView}
          />
        ))}
      </div>
    );
  },
};

/** ProfileRequests' recipe: wider segments via `itemClassName`. */
export const WideSegments: Story = {
  render: () => {
    const [view, setView] = useState<string>('requests');
    return (
      <div className="p-6">
        <SegmentedControl
          aria-label="Group by"
          options={LENSES}
          value={view}
          onValueChange={setView}
          itemClassName="px-6"
        />
      </div>
    );
  },
};

export const ThreeOptionsFullWidth: Story = {
  render: () => {
    const [view, setView] = useState<string>('day');
    return (
      <div className="max-w-md p-6">
        <SegmentedControl
          aria-label="Period"
          fullWidth
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={view}
          onValueChange={setView}
        />
      </div>
    );
  },
};

export const WithDisabledOption: Story = {
  render: () => {
    const [view, setView] = useState<string>('requests');
    return (
      <div className="p-6">
        <SegmentedControl
          aria-label="Group by"
          options={[
            LENSES[0],
            { ...LENSES[1], disabled: true },
            { value: 'other', label: 'Other' },
          ]}
          value={view}
          onValueChange={setView}
        />
      </div>
    );
  },
};

/**
 * Regression fixture: the control keeps its own height beside a taller sibling
 * in a flex row (a table toolbar, next to its search box). Without `self-center`
 * flexbox stretched every segment to the row's 44px, so the same control was
 * 36px in the page header and 44px in the card toolbar.
 */
export const BesideTallerSibling: Story = {
  render: () => {
    const [view, setView] = useState<string>('requests');
    return (
      <div className="flex gap-4 p-6">
        <div className="flex h-11 w-52 items-center rounded-lg border border-[var(--btn-tertiary-border)] bg-white px-3 text-sm text-[var(--surface-text-secondary)]">
          Search (44px)
        </div>
        <SegmentedControl
          aria-label="Group by"
          options={LENSES}
          value={view}
          onValueChange={setView}
        />
      </div>
    );
  },
};

/**
 * The same segments as tabs that own panels (the sign-in form's Username /
 * Access token): `TabsList variant="segmented"` from waldur-ui's Tabs.
 */
export const AsTabsWithPanels: Story = {
  render: () => (
    <Tabs defaultValue="username" className="w-full max-w-sm p-6">
      <TabsList variant="segmented" fullWidth aria-label="Sign in method">
        <TabsTrigger value="username">Username</TabsTrigger>
        <TabsTrigger value="token">Access token</TabsTrigger>
      </TabsList>
      <TabsContent value="username" className="pt-4 text-sm">
        Username and password fields
      </TabsContent>
      <TabsContent value="token" className="pt-4 text-sm">
        Token field
      </TabsContent>
    </Tabs>
  ),
};

/**
 * The brand variant: light brand tint segments with a solid brand selected one,
 * for a switcher that is the page's main control (a chart toolbar), where the
 * choice should read at a glance. `neutral` (the default) suits ordinary chrome.
 */
export const BrandVariant: Story = {
  render: () => {
    const [view, setView] = useState<string>('requests');
    return (
      <div className="flex flex-col items-start gap-4 p-6">
        {(['sm', 'md'] as const).map((size) => (
          <SegmentedControl
            key={size}
            aria-label={`Group by (${size})`}
            variant="brand"
            size={size}
            options={LENSES}
            value={view}
            onValueChange={setView}
          />
        ))}
      </div>
    );
  },
};

/**
 * Icons inside segments (the hook-type picker): plain Phosphor icons with a
 * `size`, not a Metronic `.svg-icon` wrapper -- that class's fixed gray fill
 * would beat the segment's text color. The segment's own gap spaces them.
 */
export const WithIcons: Story = {
  render: () => {
    const [view, setView] = useState<string>('email');
    return (
      <div className="p-6">
        <SegmentedControl
          aria-label="Hook type"
          options={[
            {
              value: 'email',
              label: (
                <>
                  <EnvelopeSimpleIcon weight="bold" size={20} />
                  Email
                </>
              ),
            },
            {
              value: 'webhook',
              label: (
                <>
                  <LinkSimpleIcon weight="bold" size={20} />
                  Webhook
                </>
              ),
            },
          ]}
          value={view}
          onValueChange={setView}
        />
      </div>
    );
  },
};

import {
  CheckCircleIcon,
  CircleIcon,
  LockIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Badge } from '../Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Tooltip } from '../Tooltip';

import { ScrollSpyItem, ScrollSpyNav } from './ScrollSpyNav';

const meta: Meta<typeof ScrollSpyNav> = {
  title: 'Navigation/ScrollSpyNav',
  component: ScrollSpyNav,
  parameters: {
    docs: {
      description: {
        component: `
### ScrollSpyNav & Section Tracking Suite

An accessible, responsive navigation primitive for multi-section views (wizards, resource creation forms, and settings pages).

#### Core Capabilities:
- **Reactive Scroll Tracking**: Powered by \`useScrollTracker\`, observes target DOM elements in the viewport and highlights the active section in real-time.
- **Scroll Strategy & Overlap**: Supports \`'area'\` (intersection percentage), \`'top'\`, or \`'bottom'\` tracking thresholds with configurable pixel offsets.
- **Smooth Navigation**: Programmatically animates scroll position with \`scrollToSection\`, compensating for sticky topbars or headers.
- **Click Lock Debounce**: When an item is clicked, keeps it highlighted while the window animates to the target, preventing temporary flicker.
- **Accessible & Router-Agnostic**: Renders semantic \`<nav>\` and \`<ul>\` markup with \`aria-current="true"\`, and provides \`renderItem\` for UI-Router, Next.js, or React Router integration.
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ScrollSpyNav>;

const BASIC_ITEMS: ScrollSpyItem[] = [
  { key: 'step-general', title: '1. General details' },
  { key: 'step-components', title: '2. Components & Quotas' },
  { key: 'step-attributes', title: '3. Attributes & Settings' },
  { key: 'step-plan', title: '4. Accounting plan' },
  { key: 'step-review', title: '5. Review & submit' },
];

const PROGRESS_ITEMS: ScrollSpyItem[] = [
  {
    key: 'step-general',
    title: (
      <div className="flex justify-between items-center w-full">
        <span>General information</span>
        <CheckCircleIcon
          weight="bold"
          className="text-emerald-500 size-5 shrink-0"
        />
      </div>
    ),
  },
  {
    key: 'step-components',
    title: (
      <div className="flex justify-between items-center w-full">
        <span>Components & limits</span>
        <CheckCircleIcon
          weight="bold"
          className="text-emerald-500 size-5 shrink-0"
        />
      </div>
    ),
  },
  {
    key: 'step-attributes',
    title: (
      <div className="flex justify-between items-center w-full">
        <span>Attributes & settings</span>
        <CircleIcon
          weight="bold"
          className="text-[var(--surface-text-muted)] size-5 shrink-0"
        />
      </div>
    ),
  },
  {
    key: 'step-plan',
    title: (
      <div className="flex justify-between items-center w-full">
        <span>Plan & pricing</span>
        <CircleIcon
          weight="bold"
          className="text-[var(--surface-text-muted)] size-5 shrink-0"
        />
      </div>
    ),
  },
  {
    key: 'step-review',
    title: (
      <div className="flex justify-between items-center w-full">
        <span>Review & confirm</span>
      </div>
    ),
  },
];

/**
 * Standard isolated navigation list with controlled active key.
 */
export const Default: Story = {
  args: {
    items: BASIC_ITEMS,
    activeKey: 'step-general',
    'aria-label': 'Form steps',
  },
  render: (args) => (
    <div className="w-72 p-4 bg-[var(--surface-page-bg)] rounded-lg border border-[var(--surface-card-border)]">
      <ScrollSpyNav {...args} />
    </div>
  ),
};

/**
 * Step 3 in progress (steps 1 & 2 completed, remaining steps pending).
 */
export const PartiallyCompleted: Story = {
  render: () => (
    <div className="w-80 p-4 bg-[var(--surface-page-bg)]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollSpyNav items={PROGRESS_ITEMS} activeKey="step-attributes" />
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * Step containing a validation warning/error with warning icon and tooltip.
 */
export const WithValidationErrors: Story = {
  render: () => {
    const errorItems: ScrollSpyItem[] = [
      PROGRESS_ITEMS[0],
      {
        key: 'step-components',
        title: (
          <div className="flex justify-between items-center w-full">
            <span className="text-amber-600 font-semibold">
              Components & limits
            </span>
            <Tooltip label="Quota exceeds project limit">
              <WarningCircleIcon
                weight="bold"
                className="text-amber-500 size-5 shrink-0 has-error"
              />
            </Tooltip>
          </div>
        ),
      },
      PROGRESS_ITEMS[2],
      PROGRESS_ITEMS[3],
      PROGRESS_ITEMS[4],
    ];

    return (
      <div className="w-80 p-4 bg-[var(--surface-page-bg)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollSpyNav items={errorItems} activeKey="step-components" />
          </CardContent>
        </Card>
      </div>
    );
  },
};

/**
 * Live, interactive demo where scrolling through the right-hand container
 * dynamically updates the active item in the sticky ScrollSpyNav.
 */
export const InteractiveScrolling: Story = {
  render: () => {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    const sections = [
      {
        id: 'interactive-step-1',
        title: '1. General details',
        description:
          'Name, customer scope, category selection, and offering identity.',
        color: 'border-l-sky-500',
      },
      {
        id: 'interactive-step-2',
        title: '2. Components & Quotas',
        description:
          'Hardware allocations, RAM, CPU cores, storage limits, and network interfaces.',
        color: 'border-l-amber-500',
      },
      {
        id: 'interactive-step-3',
        title: '3. Attributes & Settings',
        description:
          'Integration credentials, endpoints, management URLs, and advanced toggles.',
        color: 'border-l-emerald-500',
      },
      {
        id: 'interactive-step-4',
        title: '4. Accounting plan',
        description:
          'Billing units, price models, prepaid packages, and VAT rates.',
        color: 'border-l-purple-500',
      },
      {
        id: 'interactive-step-5',
        title: '5. Review & submit',
        description:
          'Final validation checklist and terms of service acceptance.',
        color: 'border-l-rose-500',
      },
    ];

    const navItems: ScrollSpyItem[] = sections.map((sec) => ({
      key: sec.id,
      title: sec.title,
    }));

    return (
      <div className="flex gap-6 max-w-4xl h-[480px] bg-[var(--surface-page-bg)] p-6 rounded-xl border border-[var(--surface-card-border)]">
        {/* Sticky sidebar */}
        <div className="w-64 shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Form Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollSpyNav
                items={navItems}
                container={container}
                scrollOffset={20}
              />
            </CardContent>
          </Card>
        </div>

        {/* Scrollable content panels */}
        <div
          ref={setContainer}
          className="flex-1 overflow-y-auto space-y-6 pr-2 rounded-lg"
          style={{ scrollBehavior: 'smooth' }}
        >
          {sections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className={`p-6 bg-[var(--surface-card-bg)] rounded-lg border border-[var(--surface-card-border)] border-l-4 ${sec.color} shadow-xs min-h-[220px]`}
            >
              <h3 className="text-base font-bold text-[var(--surface-text-primary)]">
                {sec.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--surface-text-secondary)]">
                {sec.description}
              </p>
              <div className="mt-6 p-4 bg-[var(--surface-ground)] rounded border border-dashed border-[var(--surface-card-border)] text-xs text-[var(--surface-text-muted)]">
                Scroll target anchor:{' '}
                <code className="font-mono">#{sec.id}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Embedded in a Card component, reflecting how single-page wizard sidebars
 * (e.g. `FormSteps.tsx` and `CreatePageSidebar.tsx`) are structured.
 */
export const InsideCard: Story = {
  render: () => (
    <div className="w-80 p-4 bg-[var(--surface-page-bg)]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--surface-text-secondary)]">
            Create Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollSpyNav items={BASIC_ITEMS} activeKey="step-attributes" />
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * Wizard step layout with completed, active, pending, and locked steps.
 * Demonstrates locked step styling and icons as rendered by FormSteps.
 */
export const WizardFormSteps: Story = {
  render: () => {
    const wizardItems: ScrollSpyItem[] = [
      {
        key: 'step-general',
        title: (
          <div className="flex justify-between items-center w-full">
            <span>General information</span>
            <CircleIcon
              weight="bold"
              className="text-[var(--surface-text-muted)] size-5 shrink-0"
            />
          </div>
        ),
      },
      {
        key: 'step-plan',
        title: (
          <div className="flex justify-between items-center w-full text-[var(--surface-text-muted)]">
            <span>Plan</span>
            <LockIcon
              weight="bold"
              className="text-[var(--surface-text-muted)] size-5 shrink-0"
            />
          </div>
        ),
        disabled: true,
      },
      {
        key: 'step-additional',
        title: (
          <div className="flex justify-between items-center w-full text-[var(--surface-text-muted)]">
            <span>Additional configuration</span>
            <LockIcon
              weight="bold"
              className="text-[var(--surface-text-muted)] size-5 shrink-0"
            />
          </div>
        ),
        disabled: true,
      },
      {
        key: 'step-final',
        title: (
          <div className="flex justify-between items-center w-full text-[var(--surface-text-muted)]">
            <span>Final confirmation</span>
            <LockIcon
              weight="bold"
              className="text-[var(--surface-text-muted)] size-5 shrink-0"
            />
          </div>
        ),
        disabled: true,
      },
    ];

    return (
      <div className="w-80 p-4 bg-[var(--surface-page-bg)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Wizard Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollSpyNav items={wizardItems} activeKey="step-general" />
          </CardContent>
        </Card>
      </div>
    );
  },
};

/**
 * Navigation items enhanced with completion badges, required markers, and validation error icons.
 */
export const WithStatusIndicators: Story = {
  render: () => {
    const statusItems: ScrollSpyItem[] = [
      {
        key: 'step-1',
        title: (
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <CheckCircleIcon
                weight="fill"
                className="text-emerald-500 size-4 shrink-0"
              />
              <span>General info</span>
            </span>
            <Badge variant="success" size="sm" tone="light">
              Completed
            </Badge>
          </div>
        ),
      },
      {
        key: 'step-2',
        title: (
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <WarningCircleIcon
                weight="bold"
                className="text-amber-500 size-4 shrink-0 has-error"
              />
              <span>Quotas & limits</span>
            </span>
            <Badge variant="warning" size="sm" tone="light">
              2 errors
            </Badge>
          </div>
        ),
      },
      {
        key: 'step-3',
        title: (
          <div className="flex items-center justify-between gap-2">
            <span>Security settings</span>
            <Badge variant="primary" size="sm" tone="solid">
              Required
            </Badge>
          </div>
        ),
      },
      {
        key: 'step-4',
        title: 'Confirmation',
        disabled: true,
      },
    ];

    return (
      <div className="w-80 p-4 bg-[var(--surface-page-bg)]">
        <Card>
          <CardContent className="pt-6">
            <ScrollSpyNav items={statusItems} activeKey="step-2" />
          </CardContent>
        </Card>
      </div>
    );
  },
};

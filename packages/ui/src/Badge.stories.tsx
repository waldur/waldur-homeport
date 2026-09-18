import {
  ArrowRightIcon,
  CheckIcon,
  InfoIcon,
  StarIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Badge,
  type BadgeShape,
  type BadgeTone,
  type BadgeVariant,
} from './Badge';

const VARIANTS: BadgeVariant[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
  'purple',
  'blue',
  'indigo',
  'moss',
  'pink',
  'teal',
  'orange',
  'rose',
];

const TONES: BadgeTone[] = ['outline', 'light', 'solid'];
const SHAPES: BadgeShape[] = ['rounded', 'pill', 'circle', 'roundless'];

const meta: Meta<typeof Badge> = {
  title: 'Data Display/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    tone: { control: 'select', options: TONES },
    shape: { control: 'select', options: SHAPES },
    size: { control: 'select', options: ['sm', 'lg'] },
    hasBullet: { control: 'boolean' },
    onlyIcon: { control: 'boolean' },
    tooltip: { control: 'text' },
  },
  args: {
    children: 'Badge',
    variant: 'primary',
    tone: 'outline',
    shape: 'rounded',
    hasBullet: false,
    onlyIcon: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Waldur design-system Badge supporting 15 variants and 3 tones (outline, light, solid), with pill, roundless, bullet, icon slots, tooltips, and backwards compatibility for legacy call patterns.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

/**
 * Full variant × tone matrix.
 * Supports all 15 core design-token color ramps across outline, light, and solid tones.
 */
export const VariantToneMatrix: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] space-y-6">
      {TONES.map((tone) => (
        <div key={tone}>
          <h4 className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-3">
            Tone: {tone}
          </h4>
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant} tone={tone}>
                {variant}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Shape variants: standard rounded (8px via design token), pill (full-rounded), and roundless (square).
 */
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-6 items-center">
      <Badge variant="primary" tone="outline">
        Standard (8px)
      </Badge>
      <Badge variant="primary" shape="pill" tone="outline">
        Pill Shape
      </Badge>
      <Badge variant="primary" shape="roundless" tone="outline">
        Roundless
      </Badge>
      <Badge variant="success" shape="pill" tone="solid">
        Solid Pill
      </Badge>
      <Badge variant="neutral" shape="roundless" tone="outline">
        Neutral Square
      </Badge>
    </div>
  ),
};

/**
 * Sizing edge cases: Small (sm), Default, and Large (lg), comparing default vs pill.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 w-24">Standard:</span>
        <Badge variant="success" size="sm" tone="outline">
          Small (sm)
        </Badge>
        <Badge variant="success" tone="outline">
          Default
        </Badge>
        <Badge variant="success" size="lg" tone="outline">
          Large (lg)
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 w-24">Pill:</span>
        <Badge variant="primary" size="sm" shape="pill" tone="light">
          Small (sm)
        </Badge>
        <Badge variant="primary" shape="pill" tone="light">
          Default
        </Badge>
        <Badge variant="primary" size="lg" shape="pill" tone="light">
          Large (lg)
        </Badge>
      </div>
    </div>
  ),
};

/**
 * Icons and Slots edge cases:
 * - Left icon slot (leftIcon)
 * - Right icon slot (rightIcon)
 * - Both left and right icons
 * - Scaled with sizes sm, default, and lg
 */
export const IconsAndSlots: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="success"
          leftIcon={<CheckIcon size={14} weight="bold" />}
          shape="pill"
          tone="outline"
        >
          Approved
        </Badge>
        <Badge
          variant="warning"
          leftIcon={<WarningIcon size={14} weight="bold" />}
          shape="pill"
          tone="outline"
        >
          Review Pending
        </Badge>
        <Badge
          variant="info"
          rightIcon={<ArrowRightIcon size={14} weight="bold" />}
          shape="pill"
          tone="outline"
        >
          Next Step
        </Badge>
        <Badge
          variant="purple"
          leftIcon={<StarIcon size={14} weight="fill" />}
          rightIcon={<ArrowRightIcon size={14} weight="bold" />}
          shape="pill"
          tone="light"
        >
          Featured Offer
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant="teal"
          size="sm"
          leftIcon={<CheckIcon size={12} weight="bold" />}
          tone="outline"
        >
          Small with Icon
        </Badge>
        <Badge
          variant="teal"
          leftIcon={<CheckIcon size={14} weight="bold" />}
          tone="outline"
        >
          Default with Icon
        </Badge>
        <Badge
          variant="teal"
          size="lg"
          leftIcon={<CheckIcon size={16} weight="bold" />}
          tone="outline"
        >
          Large with Icon
        </Badge>
      </div>
    </div>
  ),
};

/**
 * Icon-only edge cases:
 * Badges that contain solely an icon without text label (`onlyIcon` prop).
 */
export const OnlyIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <Badge
        variant="primary"
        leftIcon={<StarIcon size={14} weight="fill" />}
        tone="solid"
        onlyIcon
      />
      <Badge
        variant="success"
        leftIcon={<CheckIcon size={14} weight="bold" />}
        shape="pill"
        tone="solid"
        onlyIcon
      />
      <Badge
        variant="danger"
        leftIcon={<XIcon size={14} weight="bold" />}
        shape="pill"
        tone="light"
        onlyIcon
      />
      <Badge
        variant="warning"
        leftIcon={<WarningIcon size={14} weight="bold" />}
        tone="outline"
        onlyIcon
      />
      <Badge
        variant="info"
        size="sm"
        leftIcon={<InfoIcon size={12} weight="bold" />}
        shape="pill"
        tone="solid"
        onlyIcon
      />
      <Badge
        variant="purple"
        size="lg"
        leftIcon={<StarIcon size={18} weight="fill" />}
        shape="pill"
        tone="solid"
        onlyIcon
      />
    </div>
  ),
};

/**
 * Bullet indicator edge cases:
 * `hasBullet` renders an inline status dot matching the badge's text color.
 */
export const Bullets: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success" shape="pill" tone="outline" hasBullet>
          Online
        </Badge>
        <Badge variant="warning" shape="pill" tone="outline" hasBullet>
          Maintenance
        </Badge>
        <Badge variant="danger" shape="pill" tone="outline" hasBullet>
          Offline
        </Badge>
        <Badge variant="neutral" shape="pill" tone="outline" hasBullet>
          Disabled
        </Badge>
        <Badge variant="orange" shape="pill" tone="outline" hasBullet>
          High Load
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success" tone="light" hasBullet>
          Light Tone Bullet
        </Badge>
        <Badge variant="success" tone="solid" hasBullet>
          Solid Tone Bullet
        </Badge>
        <Badge variant="info" size="sm" shape="pill" tone="outline" hasBullet>
          Small Bullet
        </Badge>
        <Badge variant="info" size="lg" shape="pill" tone="outline" hasBullet>
          Large Bullet
        </Badge>
      </div>
    </div>
  ),
};

/**
 * Tooltip integration edge cases:
 * Badges rendered with the built-in `tooltip` and `tooltipProps`.
 */
export const Tooltips: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-6">
      <Badge
        variant="info"
        shape="pill"
        tone="outline"
        tooltip="This resource is synchronized with the backend."
      >
        Hover for Tooltip
      </Badge>
      <Badge
        variant="danger"
        leftIcon={<WarningIcon size={14} weight="bold" />}
        shape="pill"
        tone="light"
        tooltip="Critical: Node memory usage exceeds 90%."
        tooltipProps={{ side: 'bottom' }}
      >
        Critical Warning
      </Badge>
      <Badge
        variant="success"
        shape="pill"
        tone="outline"
        hasBullet
        tooltip="All 12 microservices reporting healthy status."
      >
        12 / 12 Healthy
      </Badge>
    </div>
  ),
};

/**
 * Counter badges and text overflow edge cases:
 * - Numeric counts (0, 5, 99+, 1000+)
 * - Truncation in narrow constrained parents
 */
export const CountersAndOverflow: Story = {
  render: () => (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h5 className="text-xs uppercase font-mono text-gray-500 mb-2">
          Numeric Counter Badges
        </h5>
        <div className="flex items-center gap-3">
          <Badge variant="neutral" shape="pill" tone="outline">
            0
          </Badge>
          <Badge variant="primary" shape="pill" tone="solid">
            3
          </Badge>
          <Badge variant="danger" shape="pill" tone="solid">
            99+
          </Badge>
          <Badge variant="warning" size="sm" shape="pill" tone="solid">
            1.2k
          </Badge>
        </div>
      </div>

      <div>
        <h5 className="text-xs uppercase font-mono text-gray-500 mb-2">
          Constrained Container & Text Truncation
        </h5>
        <div className="w-48 p-3 border rounded bg-white dark:bg-neutral-900 flex flex-col gap-2">
          <span className="text-xs text-gray-400">Container width: 192px</span>
          <Badge
            variant="secondary"
            tone="outline"
            className="truncate max-w-full"
          >
            Very long organizational project name that will be truncated
          </Badge>
          <Badge
            variant="info"
            shape="pill"
            tone="light"
            className="truncate max-w-full"
          >
            Short label
          </Badge>
        </div>
      </div>
    </div>
  ),
};

/**
 * Interactive badge edge cases:
 * Badges used as clickable tags or dismissible filters.
 */
export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <Badge
        variant="primary"
        shape="pill"
        tone="outline"
        className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
        onClick={() => alert('Badge clicked')}
      >
        Clickable Badge
      </Badge>
      <Badge
        variant="neutral"
        rightIcon={
          <button
            type="button"
            aria-label="Remove filter"
            className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => alert('Filter removed')}
          >
            <XIcon size={12} weight="bold" />
          </button>
        }
        shape="pill"
        tone="outline"
        className="gap-1.5 pr-1.5"
      >
        Filter: OpenStack
      </Badge>
    </div>
  ),
};

/**
 * Circle badge variations:
 * Used for status indicators, unread counters, notification dots, and alert markers.
 */
export const Circle: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500">Default (md)</span>
        <div className="flex items-center gap-2">
          <Badge variant="primary" shape="circle">
            1
          </Badge>
          <Badge variant="warning" shape="circle">
            !
          </Badge>
          <Badge variant="danger" shape="circle">
            9
          </Badge>
          <Badge variant="success" shape="circle">
            ✓
          </Badge>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500">Small (sm)</span>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm" shape="circle">
            1
          </Badge>
          <Badge variant="warning" size="sm" shape="circle">
            !
          </Badge>
          <Badge variant="danger" size="sm" shape="circle">
            3
          </Badge>
          <Badge variant="neutral" size="sm" shape="circle" tone="light">
            4
          </Badge>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500">Large (lg)</span>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg" shape="circle">
            1
          </Badge>
          <Badge variant="purple" size="lg" shape="circle">
            A
          </Badge>
        </div>
      </div>
    </div>
  ),
};

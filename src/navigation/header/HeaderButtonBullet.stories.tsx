import {
  BellIcon,
  ChatCircleDotsIcon,
  FunnelSimpleIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  HeaderButtonBullet,
  HeaderButtonBulletVariant,
} from './HeaderButtonBullet';

const VARIANTS: HeaderButtonBulletVariant[] = [
  'success',
  'primary',
  'danger',
  'gray-500',
];

const meta: Meta<typeof HeaderButtonBullet> = {
  title: 'Navigation/HeaderButtonBullet',
  component: HeaderButtonBullet,
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'The color variant of the bullet indicator.',
    },
    size: {
      control: { type: 'number', min: 4, max: 20, step: 1 },
      description: 'The diameter of the bullet in pixels.',
    },
    blink: {
      control: 'boolean',
      description: 'Whether the bullet pulses/blinks continuously.',
    },
  },
  args: {
    variant: 'success',
    size: 6,
    blink: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A notification dot / bullet indicator anchored to header or navigation buttons. ' +
          'Supports 4 semantic variants (`success`, `primary` brand mark, `danger`, and `gray-500`), ' +
          'customizable pixel sizing, and continuous blink animation.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HeaderButtonBullet>;

/**
 * Interactive playground with an icon button anchor so the bullet's
 * absolute positioning and size can be inspected interactively.
 */
export const Default: Story = {
  render: (args) => (
    <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
      <BellIcon size={20} weight="bold" />
      <HeaderButtonBullet {...args} data-testid="bullet-indicator" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bullet = canvas.getByTestId('bullet-indicator');
    await expect(bullet).toBeInTheDocument();
    await expect(bullet).toHaveClass(
      'inline-block',
      'shrink-0',
      'rounded-full',
      'absolute',
      'top-0',
      'end-0',
      '-translate-x-1/2',
      '-translate-y-1/2',
      'bg-success',
      'animation-blink',
    );
  },
};

/**
 * All four color variants shown side-by-side with their semantic use cases.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
          <BellIcon size={20} weight="bold" />
          <HeaderButtonBullet
            variant="success"
            blink={false}
            data-testid="bullet-success"
          />
        </div>
        <span className="text-xs text-secondary font-medium">
          success (default)
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
          <FunnelSimpleIcon size={20} weight="bold" />
          <HeaderButtonBullet
            variant="primary"
            blink={false}
            data-testid="bullet-primary"
          />
        </div>
        <span className="text-xs text-secondary font-medium">
          primary (brand mark)
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
          <BellIcon size={20} weight="bold" />
          <HeaderButtonBullet
            variant="danger"
            blink={false}
            data-testid="bullet-danger"
          />
        </div>
        <span className="text-xs text-secondary font-medium">danger</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
          <ChatCircleDotsIcon size={20} weight="bold" />
          <HeaderButtonBullet
            variant="gray-500"
            blink={false}
            data-testid="bullet-gray"
          />
        </div>
        <span className="text-xs text-secondary font-medium">gray-500</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const successBullet = canvas.getByTestId('bullet-success');
    const primaryBullet = canvas.getByTestId('bullet-primary');
    const dangerBullet = canvas.getByTestId('bullet-danger');
    const grayBullet = canvas.getByTestId('bullet-gray');

    await expect(successBullet).toHaveClass('bg-success');
    await expect(primaryBullet).toHaveClass('bg-[var(--text-brand)]');
    await expect(dangerBullet).toHaveClass('bg-danger');
    await expect(grayBullet).toHaveClass(
      'bg-gray-500',
      'dark:bg-gray-dark-400',
    );
  },
};

/**
 * Common bullet sizes (6px default, 8px, 9px, 10px).
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      {[6, 8, 9, 10, 12].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
            <BellIcon size={20} weight="bold" />
            <HeaderButtonBullet
              size={size}
              blink={false}
              data-testid={`bullet-size-${size}`}
            />
          </div>
          <span className="text-xs text-secondary font-medium">{size}px</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of [6, 8, 9, 10, 12]) {
      const bullet = canvas.getByTestId(`bullet-size-${size}`);
      await expect(bullet).toBeInTheDocument();
      await expect(bullet).toHaveStyle({
        width: `${size}px`,
        height: `${size}px`,
      });
    }
  },
};

/**
 * Side-by-side comparison of static vs blinking animation.
 */
export const BlinkingVsStatic: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
          <BellIcon size={20} weight="bold" />
          <HeaderButtonBullet blink={false} data-testid="bullet-static" />
        </div>
        <span className="text-xs text-secondary font-medium">Static</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex size-10 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary">
          <BellIcon size={20} weight="bold" />
          <HeaderButtonBullet blink={true} data-testid="bullet-blinking" />
        </div>
        <span className="text-xs text-secondary font-medium">Blinking</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const staticBullet = canvas.getByTestId('bullet-static');
    const blinkingBullet = canvas.getByTestId('bullet-blinking');

    await expect(staticBullet).not.toHaveClass('animation-blink');
    await expect(blinkingBullet).toHaveClass('animation-blink');
  },
};

/**
 * Real-world usage examples matching header and sidebar buttons.
 */
export const RealWorldButtons: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {/* Notifications bell button */}
      <button
        type="button"
        className="relative inline-flex size-9 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary hover:bg-secondary"
        aria-label="Notifications"
      >
        <BellIcon size={20} weight="bold" />
        <HeaderButtonBullet variant="success" />
      </button>

      {/* Filter funnel button in sidebar */}
      <span
        role="button"
        tabIndex={0}
        className="relative flex size-6 shrink-0 items-center justify-center rounded text-secondary hover:bg-secondary cursor-pointer"
        aria-label="Filter resources"
      >
        <FunnelSimpleIcon size={18} weight="bold" />
        <HeaderButtonBullet
          size={9}
          blink={false}
          variant="primary"
          className="-me-2 mt-2 border-[1px] border-2 border-secondary"
        />
      </span>

      {/* Chat drawer toggle */}
      <button
        type="button"
        className="relative inline-flex size-9 items-center justify-center rounded-lg border-[1px] border-secondary text-secondary hover:bg-secondary"
        aria-label="AI Assistant"
      >
        <ChatCircleDotsIcon size={20} weight="bold" />
        <HeaderButtonBullet variant="gray-500" blink={false} />
      </button>
    </div>
  ),
};

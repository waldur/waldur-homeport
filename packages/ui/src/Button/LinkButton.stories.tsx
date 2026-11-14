import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { LinkButton } from './LinkButton';

/**
 * LinkButton renders a semantic `<button type="button">` styled visually as an
 * inline hyperlink.
 *
 * Use LinkButton for interactive actions (modal triggers, inline expanders, "Show more",
 * "Try again", table cell actions) that live inside sentences or data lists.
 * For true page navigation, use the application's `Link` component.
 */
const meta: Meta<typeof LinkButton> = {
  title: 'Buttons/LinkButton',
  component: LinkButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['brand', 'danger', 'subtle'],
      description: 'Visual color and underline style',
    },
    size: {
      control: 'select',
      options: ['sm', 'inherit'],
      description: 'Text size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state with disabled cursor and muted text',
    },
    children: {
      control: 'text',
      description: 'Button label or contents',
    },
  },
  args: {
    children: 'Show details',
    variant: 'brand',
    size: 'sm',
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof LinkButton>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-6">
        <span className="w-24 text-xs text-quinary">Brand (default):</span>
        <LinkButton variant="brand">View full report</LinkButton>
        <LinkButton variant="brand" disabled>
          View full report (disabled)
        </LinkButton>
      </div>

      <div className="flex items-center gap-6">
        <span className="w-24 text-xs text-quinary">Danger:</span>
        <LinkButton variant="danger">Remove attachment</LinkButton>
        <LinkButton variant="danger" disabled>
          Remove attachment (disabled)
        </LinkButton>
      </div>

      <div className="flex items-center gap-6">
        <span className="w-24 text-xs text-quinary">Subtle:</span>
        <LinkButton variant="subtle">Edit plan details</LinkButton>
        <LinkButton variant="subtle" disabled>
          Edit plan details (disabled)
        </LinkButton>
      </div>
    </div>
  ),
};

export const InlineProse: Story = {
  render: () => (
    <div className="max-w-md p-4 text-sm text-secondary leading-relaxed bg-card rounded-lg border border-secondary">
      <p>
        The requested virtual instance is currently scheduled for deployment.{' '}
        <LinkButton variant="brand">Check live provisioning log</LinkButton> for
        real-time status updates, or{' '}
        <LinkButton variant="subtle">modify network settings</LinkButton> if
        needed. If you no longer need this resource, you can{' '}
        <LinkButton variant="danger">cancel this order</LinkButton> anytime
        before deployment begins.
      </p>
    </div>
  ),
};

export const ExpandCollapseToggle: Story = {
  render: function ToggleStory() {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="max-w-md p-4 bg-card rounded-lg border border-secondary text-sm">
        <p className="text-secondary">
          {expanded
            ? 'OpenStack provides an open-source cloud computing platform for public and private clouds. It controls large pools of compute, storage, and networking resources throughout a datacenter, managed through a dashboard or via the OpenStack API.'
            : 'OpenStack provides an open-source cloud computing platform for public and private clouds...'}
        </p>
        <div className="mt-2">
          <LinkButton
            variant="brand"
            className="font-medium"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </LinkButton>
        </div>
      </div>
    );
  },
};

const VARIANTS = ['brand', 'danger', 'subtle'] as const;
const STATES = [
  'enabled',
  'hovered',
  'focused',
  'pressed',
  'disabled',
] as const;

export const StateMatrix: Story = {
  parameters: {
    pseudo: {
      hover: VARIANTS.map((v) => `#link-btn-hovered-${v}`),
      focusVisible: VARIANTS.map((v) => `#link-btn-focused-${v}`),
      active: VARIANTS.map((v) => `#link-btn-pressed-${v}`),
    },
  },
  render: () => (
    <div className="p-6 inline-block bg-page">
      {/* eslint-disable-next-line waldur-custom/no-hand-rolled-table */}
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-24 text-left font-medium text-quaternary pb-3">
              State
            </th>
            <th className="px-4 text-left font-medium text-quaternary pb-3">
              Brand
            </th>
            <th className="px-4 text-left font-medium text-quaternary pb-3">
              Danger
            </th>
            <th className="px-4 text-left font-medium text-quaternary pb-3">
              Subtle
            </th>
          </tr>
        </thead>
        <tbody>
          {STATES.map((state) => (
            <tr key={state} className="border-t border-secondary">
              <td className="py-2.5 font-medium text-quaternary capitalize">
                {state}
              </td>
              {VARIANTS.map((variant) => (
                <td key={variant} className="px-4 py-2.5">
                  <LinkButton
                    id={`link-btn-${state}-${variant}`}
                    variant={variant}
                    disabled={state === 'disabled'}
                  >
                    Action link
                  </LinkButton>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

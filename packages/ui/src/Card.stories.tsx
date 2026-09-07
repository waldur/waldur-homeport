import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from './BaseButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Card component family (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) ported from the shadcn recipe with Metronic surface tokens, shadow/border parity, and light/dark theme adaptation.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

/**
 * Standard structured Card containing header, title, description, content body, and action footer.
 */
export const StructuredCard: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Virtual Machine Overview</CardTitle>
          <CardDescription>
            Deployment specifications and active allocation status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-[var(--surface-text-secondary)]">
            <div className="flex justify-between">
              <span>Flavor:</span>
              <span className="font-medium text-[var(--surface-text-primary)]">
                m1.medium (2 vCPU, 4GB RAM)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Storage:</span>
              <span className="font-medium text-[var(--surface-text-primary)]">
                40 GB NVMe
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-[var(--pill-success-text)]">
                Active & Running
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t border-[var(--surface-card-border)] pt-4">
          <BaseButton variant="secondary" size="sm" label="Manage" />
          <BaseButton variant="primary" size="sm" label="Restart" />
        </CardFooter>
      </Card>
    </div>
  ),
};

/**
 * Simple Card container with minimal padding for embedded widgets or statistics.
 */
export const SimpleCard: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] max-w-sm">
      <Card className="p-4">
        <div className="text-xs font-mono uppercase text-[var(--surface-text-muted)]">
          Total Usage
        </div>
        <div className="text-2xl font-bold text-[var(--surface-text-primary)] mt-1">
          1,420.50 EUR
        </div>
        <div className="text-xs text-[var(--surface-text-secondary)] mt-2">
          +12% from previous billing cycle
        </div>
      </Card>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card, CardContent } from '../Card';
import { Input } from '../Input';

import { StepCard } from './StepCard';
import { StepNav, StepNavStep } from './StepNav';
import { StepperLayout } from './StepperLayout';

const STEPS: StepNavStep[] = [
  { id: 'layout-general', label: 'General information', status: 'complete' },
  { id: 'layout-plan', label: 'Plan', status: 'required' },
  { id: 'layout-network', label: 'Network', status: 'required' },
  { id: 'layout-final', label: 'Final configuration' },
];

const Page = () => (
  <>
    <StepperLayout.Header className="px-8">
      <h1 className="m-0 text-2xl font-semibold text-primary">Add a VM</h1>
    </StepperLayout.Header>
    <StepperLayout.Container className="px-8">
      <StepperLayout.Body>
        {STEPS.map((step) => (
          <StepCard key={step.id} id={step.id} title={String(step.label)}>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Input key={i} aria-label={`Field ${i + 1}`} />
              ))}
            </div>
          </StepCard>
        ))}
      </StepperLayout.Body>
      <StepperLayout.Aside>
        <div className="flex flex-col gap-4">
          <StepNav steps={STEPS} />
          <Card bordered>
            <CardContent>Order summary</CardContent>
          </Card>
        </div>
      </StepperLayout.Aside>
    </StepperLayout.Container>
  </>
);

const meta: Meta = {
  title: 'Wizard/StepperLayout',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page of a long, single-page form: header, steps and a sticky side column (from xl) for the step nav and summary. The column sticks below `--layout-sticky-top` and is as tall as `--layout-sticky-height`, which the app chrome sets.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/** The window scrolls, as in the portal (with no sticky chrome here). */
export const WindowScroll: Story = {
  render: () => (
    <div className="bg-secondary">
      <Page />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const aside = canvasElement.querySelector(
      '[data-slot="stepper-layout-aside"]',
    ) as HTMLElement;
    await expect(getComputedStyle(aside).position).toBe('sticky');
    await expect(getComputedStyle(aside).top).toBe('10px');
    await expect(
      within(canvasElement).getByRole('navigation'),
    ).toBeInTheDocument();
  },
};

/**
 * An inner pane scrolls below a 65px top bar, as in waldur-shell's
 * `AppShell`: the pane is a size container and sets the sticky height to
 * its own.
 */
export const InnerPaneScroll: Story = {
  render: () => (
    <div className="flex h-[600px] flex-col bg-secondary">
      <div className="h-[65px] shrink-0 border-b border-secondary bg-primary" />
      <div
        data-testid="pane"
        className="flex flex-1 flex-col overflow-y-auto [container-type:size] [--layout-sticky-top:0px] [--layout-sticky-height:100cqh]"
      >
        <Page />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pane = within(canvasElement).getByTestId('pane');
    const aside = canvasElement.querySelector(
      '[data-slot="stepper-layout-aside"]',
    ) as HTMLElement;
    if (window.innerWidth >= 1200) {
      // As tall as the pane, less the 10px gap above it.
      await expect(aside.getBoundingClientRect().height).toBeCloseTo(
        pane.clientHeight - 10,
        0,
      );
    }
  },
};

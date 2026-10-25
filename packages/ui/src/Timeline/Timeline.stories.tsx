import {
  CheckCircleIcon,
  ClockIcon,
  ShieldWarningIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AvatarFallback, AvatarRoot } from '../Avatar';
import { Badge } from '../Badge';

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIcon,
  TimelineItem,
} from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Data Display/Timeline',
  component: Timeline,
  parameters: {
    docs: {
      description: {
        component:
          'Accessible timeline component for audit logs, revision history, and comment threads. Automatically handles connector segmenting and suppresses the trailing line on the final item.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  render: () => (
    <div className="max-w-md p-6 bg-primary">
      <Timeline aria-label="Activity history">
        <TimelineItem>
          <TimelineConnector />
          <TimelineIcon>
            <AvatarRoot className="size-8">
              <AvatarFallback className="bg-brand-subtle text-brand text-xs font-medium">
                AA
              </AvatarFallback>
            </AvatarRoot>
          </TimelineIcon>
          <TimelineContent>
            <div className="text-xs text-quaternary">
              <span className="font-medium text-sm text-primary mr-2">
                Alice Andersen
              </span>
              <span>2 hours ago</span>
            </div>
            <p className="text-sm text-secondary mt-1 mb-0">
              Approved policy action and verified resource quotas.
            </p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineConnector />
          <TimelineIcon>
            <AvatarRoot className="size-8">
              <AvatarFallback className="bg-success-subtle text-success text-xs font-medium">
                BB
              </AvatarFallback>
            </AvatarRoot>
          </TimelineIcon>
          <TimelineContent>
            <div className="text-xs text-quaternary">
              <span className="font-medium text-sm text-primary mr-2">
                Bob Berg
              </span>
              <span>yesterday</span>
            </div>
            <p className="text-sm text-secondary mt-1 mb-0">
              Updated contact details and organization address.
            </p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineConnector />
          <TimelineIcon>
            <AvatarRoot className="size-8">
              <AvatarFallback className="bg-neutral-subtle text-neutral text-xs font-medium">
                SYS
              </AvatarFallback>
            </AvatarRoot>
          </TimelineIcon>
          <TimelineContent>
            <div className="text-xs text-quaternary">
              <span className="font-medium text-sm text-primary mr-2">
                System
              </span>
              <span>30 days ago</span>
            </div>
            <p className="text-sm text-secondary mt-1 mb-0">
              Created initial resource definition.
            </p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const SingleItem: Story = {
  render: () => (
    <div className="max-w-md p-6 bg-primary">
      <Timeline aria-label="Single event">
        <TimelineItem>
          <TimelineConnector />
          <TimelineIcon>
            <AvatarRoot className="size-8">
              <AvatarFallback className="bg-brand-subtle text-brand text-xs font-medium">
                JD
              </AvatarFallback>
            </AvatarRoot>
          </TimelineIcon>
          <TimelineContent>
            <div className="text-xs text-quaternary">
              <span className="font-medium text-sm text-primary mr-2">
                John Doe
              </span>
              <span>Just now</span>
            </div>
            <p className="text-sm text-secondary mt-1 mb-0">
              Single entry timeline demonstrating automatic connector
              suppression.
            </p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const WithSelection: Story = {
  render: () => (
    <div className="max-w-md p-6 bg-primary">
      <Timeline aria-label="Version revisions">
        <TimelineItem className="rounded bg-brand-subtle" isSelected>
          <TimelineConnector />
          <TimelineIcon>
            <AvatarRoot className="size-8">
              <AvatarFallback className="bg-brand-600 text-white text-xs font-semibold">
                v3
              </AvatarFallback>
            </AvatarRoot>
          </TimelineIcon>
          <TimelineContent className="py-2 pr-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm text-primary">
                Current revision
              </span>
              <Badge variant="success" size="sm" shape="pill" tone="outline">
                Latest
              </Badge>
            </div>
            <p className="text-xs text-secondary mt-1 mb-0">
              Selected item renders without background clipping or mask
              artifacts.
            </p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem className="rounded hover:bg-primary-hover">
          <TimelineConnector />
          <TimelineIcon>
            <AvatarRoot className="size-8">
              <AvatarFallback className="bg-neutral-subtle text-neutral text-xs font-medium">
                v2
              </AvatarFallback>
            </AvatarRoot>
          </TimelineIcon>
          <TimelineContent className="py-2 pr-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm text-primary">
                Previous revision
              </span>
              <Badge variant="secondary" size="sm" shape="pill" tone="outline">
                v2
              </Badge>
            </div>
            <p className="text-xs text-quaternary mt-1 mb-0">
              Updated policy thresholds.
            </p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const DashedVariant: Story = {
  render: () => (
    <div className="max-w-md p-6 bg-primary">
      <Timeline aria-label="Workflow progress">
        <TimelineItem>
          <TimelineConnector variant="dashed" />
          <TimelineIcon>
            <div className="size-8 rounded-full bg-success-subtle text-success flex items-center justify-center">
              <CheckCircleIcon size={18} weight="bold" />
            </div>
          </TimelineIcon>
          <TimelineContent>
            <span className="font-medium text-sm text-primary">
              Step 1: Submitted
            </span>
            <p className="text-xs text-quaternary mt-0.5 mb-0">
              Completed Oct 24, 2026
            </p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineConnector variant="dashed" />
          <TimelineIcon>
            <div className="size-8 rounded-full bg-warning-subtle text-warning flex items-center justify-center">
              <ClockIcon size={18} weight="bold" />
            </div>
          </TimelineIcon>
          <TimelineContent>
            <span className="font-medium text-sm text-primary">
              Step 2: In Review
            </span>
            <p className="text-xs text-quaternary mt-0.5 mb-0">
              Pending reviewer assessment
            </p>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineConnector variant="dashed" />
          <TimelineIcon>
            <div className="size-8 rounded-full bg-secondary text-quaternary flex items-center justify-center">
              <ShieldWarningIcon size={18} weight="bold" />
            </div>
          </TimelineIcon>
          <TimelineContent>
            <span className="font-medium text-sm text-quaternary">
              Step 3: Decision
            </span>
            <p className="text-xs text-quinary mt-0.5 mb-0">Not started</p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

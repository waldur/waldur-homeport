/* eslint-disable waldur-custom/no-retired-bootstrap-utility -- Parity fixture intentionally renders old classes for pixel diffing */
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIcon,
  TimelineItem,
} from 'waldur-ui';

type CaseId = 'basic' | 'single' | 'dashed' | 'selected';
const CASES: CaseId[] = ['basic', 'single', 'dashed', 'selected'];

interface MockItem {
  id: string;
  name: string;
  initials: string;
  time: string;
  message: string;
  color: string;
  isSelected?: boolean;
}

const ITEMS: MockItem[] = [
  {
    id: '1',
    name: 'Alice Andersen',
    initials: 'AA',
    time: '2 hours ago',
    message: 'Approved policy action and verified resource quotas.',
    color: 'bg-brand-subtle text-brand',
    isSelected: true,
  },
  {
    id: '2',
    name: 'Bob Berg',
    initials: 'BB',
    time: 'yesterday',
    message: 'Updated contact details and organization address.',
    color: 'bg-success-subtle text-success',
  },
  {
    id: '3',
    name: 'System',
    initials: 'SYS',
    time: '30 days ago',
    message: 'Created initial resource definition.',
    color: 'bg-neutral-subtle text-neutral',
  },
];

const LEGACY_TIMELINE_CSS = `
[data-role="old"] .timeline .timeline-item {
  position: relative;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: flex-start;
}
[data-role="old"] .timeline .timeline-item:last-child .timeline-line {
  bottom: 100%;
}
[data-role="old"] .timeline .timeline-line {
  display: block;
  content: ' ';
  justify-content: center;
  position: absolute;
  z-index: 0;
  left: 0;
  top: 0;
  bottom: 0;
  transform: translate(50%);
  border-left-width: 1px;
  border-left-style: dashed;
  border-left-color: var(--border-divider-medium);
}
[data-role="old"] .timeline .timeline-icon {
  z-index: 1;
  flex-shrink: 0;
  margin-right: 1rem;
}
[data-role="old"] .timeline .timeline-content {
  width: 100%;
  overflow: auto;
  margin-bottom: 1.5rem;
}
`;

const Pair = ({ caseId }: { caseId: CaseId }) => {
  const isSingle = caseId === 'single';
  const isDashed = caseId === 'dashed';
  const isSelected = caseId === 'selected';

  const items = isSingle ? [ITEMS[0]] : ITEMS;

  return (
    <div className="flex items-start gap-8 bg-primary p-6">
      <style>{LEGACY_TIMELINE_CSS}</style>
      {/* Old Metronic implementation */}
      <div className="w-[360px]" data-pair={caseId} data-role="old">
        <div className="text-xs font-semibold text-quaternary mb-3 uppercase tracking-wider">
          Old (Metronic SCSS)
        </div>
        <div className="timeline">
          {items.map((item) => {
            const selected = isSelected && item.isSelected;
            return (
              <div
                key={item.id}
                className={`timeline-item ${selected ? 'bg-brand-subtle rounded' : ''}`}
              >
                <div
                  className={`timeline-line w-[30px] ${!isDashed ? 'border-l-2 border-secondary' : ''}`}
                />
                <div className="timeline-icon me-4">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-xs font-medium ${item.color}`}
                  >
                    {item.initials}
                  </div>
                </div>
                <div className="timeline-content mb-0 pb-3">
                  <div className="text-xs text-quaternary">
                    <span className="font-medium text-sm text-primary mr-2">
                      {item.name}
                    </span>
                    <span>{item.time}</span>
                  </div>
                  <p className="text-sm text-secondary mt-1 mb-0">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New waldur-ui Timeline implementation */}
      <div className="w-[360px]" data-pair={caseId} data-role="new">
        <div className="text-xs font-semibold text-quaternary mb-3 uppercase tracking-wider">
          New (waldur-ui Timeline)
        </div>
        <Timeline>
          {items.map((item) => {
            const selected = isSelected && item.isSelected;
            return (
              <TimelineItem
                key={item.id}
                isSelected={selected}
                className={selected ? 'bg-brand-subtle rounded' : undefined}
              >
                <TimelineConnector variant={isDashed ? 'dashed' : 'solid'} />
                <TimelineIcon>
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-xs font-medium ${item.color}`}
                  >
                    {item.initials}
                  </div>
                </TimelineIcon>
                <TimelineContent>
                  <div className="text-xs text-quaternary">
                    <span className="font-medium text-sm text-primary mr-2">
                      {item.name}
                    </span>
                    <span>{item.time}</span>
                  </div>
                  <p className="text-sm text-secondary mt-1 mb-0">
                    {item.message}
                  </p>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Migration/Timeline Parity',
  parameters: {
    docs: {
      description: {
        component:
          'Old (Metronic SCSS) Timeline and the new (waldur-ui) Timeline side by side, tagged data-pair/data-role for automated visual and dimension parity testing. Compares line alignment, icon positioning, padding, and last-child cutoff across basic, single, dashed, and selected states.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-primary p-6">
      {CASES.map((caseId) => (
        <Pair key={caseId} caseId={caseId} />
      ))}
    </div>
  ),
};

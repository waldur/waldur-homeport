import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { MatrixRoomRailItem } from './MatrixRoomRailItem';

const meta: Meta<typeof MatrixRoomRailItem> = {
  title: 'Matrix/MatrixRoomRailItem',
  component: MatrixRoomRailItem,
  parameters: {
    docs: {
      description: {
        component:
          'A compact, avatar-only room icon in the collapsed team-chat rail. ' +
          'Provides quick room switching with hover tooltip, active highlight, ' +
          'call indicator badge, and unread/mention counts.',
      },
    },
  },
  args: {
    uuid: 'rail-room-1',
    name: 'General Discussion',
    unreadCount: 0,
    mentionCount: 0,
    activeCall: null,
    active: false,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-14 p-2 bg-primary border border-secondary rounded-lg flex flex-col items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MatrixRoomRailItem>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Unread: Story = {
  args: {
    unreadCount: 5,
  },
};

export const WithMentions: Story = {
  args: {
    unreadCount: 2,
    mentionCount: 1,
  },
};

export const HighUnreadCount: Story = {
  args: {
    unreadCount: 120,
  },
};

export const ActiveCall: Story = {
  args: {
    activeCall: {
      participantCount: 3,
    } as any,
  },
};

export const ActiveWithCall: Story = {
  args: {
    active: true,
    activeCall: {
      participantCount: 2,
    } as any,
  },
};

export const RailSimulation: Story = {
  render: () => (
    <div className="w-14 py-2 px-1 bg-primary border border-secondary rounded-lg flex flex-col items-center gap-1">
      <MatrixRoomRailItem
        uuid="rail-1"
        name="Project Apollo"
        unreadCount={0}
        mentionCount={0}
        activeCall={null}
        active={true}
        onClick={fn()}
      />
      <MatrixRoomRailItem
        uuid="rail-2"
        name="DevOps Team"
        unreadCount={4}
        mentionCount={1}
        activeCall={null}
        onClick={fn()}
      />
      <MatrixRoomRailItem
        uuid="rail-3"
        name="All-Hands Meeting"
        unreadCount={0}
        mentionCount={0}
        activeCall={{ participantCount: 5 } as any}
        onClick={fn()}
      />
      <MatrixRoomRailItem
        uuid="rail-4"
        name="Frontend Guild"
        unreadCount={12}
        mentionCount={0}
        activeCall={null}
        onClick={fn()}
      />
      <MatrixRoomRailItem
        uuid="rail-5"
        name="Security Announcements"
        unreadCount={0}
        mentionCount={0}
        activeCall={null}
        onClick={fn()}
      />
    </div>
  ),
};

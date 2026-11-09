import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { MatrixRoomListItem } from './MatrixRoomListItem';

const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const yesterday = now - 24 * 60 * 60 * 1000;

const meta: Meta<typeof MatrixRoomListItem> = {
  title: 'Matrix/MatrixRoomListItem',
  component: MatrixRoomListItem,
  parameters: {
    docs: {
      description: {
        component:
          'A conversation row in the Matrix team-chat drawer. Displays room avatar, title, ' +
          'relative timestamp, message preview (text, voice note, file/media attachment, or system event), ' +
          'and state indicators (unread/mention badge, muted icon, active call indicator).',
      },
    },
  },
  args: {
    uuid: 'room-default-uuid',
    name: 'General Discussion',
    preview: 'Looking forward to the upcoming sprint review!',
    previewKind: 'text',
    unreadCount: 0,
    mentionCount: 0,
    lastActivity: oneHourAgo,
    activeCall: null,
    active: false,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-primary border border-secondary rounded-lg overflow-hidden shadow-sm">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MatrixRoomListItem>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Unread: Story = {
  args: {
    unreadCount: 4,
    preview: 'Can someone please check the latest deployment logs?',
  },
};

export const WithMentions: Story = {
  args: {
    unreadCount: 2,
    mentionCount: 1,
    preview: '@alex Could you review this pull request when you have time?',
  },
};

export const HighUnreadCount: Story = {
  args: {
    unreadCount: 142,
    mentionCount: 0,
  },
};

export const Muted: Story = {
  args: {
    isMuted: true,
    unreadCount: 8,
  },
};

export const ActiveCall: Story = {
  args: {
    activeCall: {
      participantCount: 3,
    } as any,
  },
};

export const SingleParticipantCall: Story = {
  args: {
    activeCall: {
      participantCount: 1,
    } as any,
  },
};

export const VoiceMessagePreview: Story = {
  args: {
    previewKind: 'voice',
    previewSender: 'Alice',
  },
};

export const FileAttachmentPreview: Story = {
  args: {
    previewKind: 'file',
    previewFileName: 'cluster-architecture-v2.pdf',
    previewFileSize: 2_450_000,
    previewSender: 'David',
  },
};

export const ImageAttachmentPreview: Story = {
  args: {
    previewKind: 'image',
    previewFileName: 'error-screenshot.png',
    previewFileSize: 512_000,
    previewSender: 'Elena',
  },
};

export const SystemMessagePreview: Story = {
  args: {
    previewKind: 'system',
    preview: 'Alice invited Bob to the conversation',
  },
};

export const EmptyRoomFallback: Story = {
  args: {
    preview: '',
    scopeName: 'HPC Cluster Support',
    membersCount: 12,
    lastActivity: 0,
  },
};

export const ListSimulation: Story = {
  render: () => (
    <div className="divide-y divide-secondary">
      <MatrixRoomListItem
        uuid="room-1"
        name="Project Apollo"
        previewKind="text"
        preview="Everything is green on develop."
        unreadCount={0}
        mentionCount={0}
        lastActivity={now - 5 * 60 * 1000}
        activeCall={null}
        active={true}
        onClick={fn()}
      />
      <MatrixRoomListItem
        uuid="room-2"
        name="DevOps & Infrastructure"
        previewKind="text"
        preview="@channel Alert: node-4 memory usage > 90%"
        unreadCount={3}
        mentionCount={1}
        lastActivity={now - 12 * 60 * 1000}
        activeCall={null}
        onClick={fn()}
      />
      <MatrixRoomListItem
        uuid="room-3"
        name="Weekly Sync"
        previewKind="text"
        unreadCount={0}
        mentionCount={0}
        lastActivity={now - 20 * 60 * 1000}
        activeCall={{ participantCount: 4 } as any}
        onClick={fn()}
      />
      <MatrixRoomListItem
        uuid="room-4"
        name="Design & UX"
        previewKind="image"
        previewFileName="new-mockups.png"
        previewFileSize={1_200_000}
        previewSender="Sophie"
        unreadCount={2}
        mentionCount={0}
        lastActivity={yesterday}
        activeCall={null}
        onClick={fn()}
      />
      <MatrixRoomListItem
        uuid="room-5"
        name="Announcements"
        previewKind="text"
        preview="System maintenance scheduled for Saturday."
        unreadCount={15}
        mentionCount={0}
        isMuted={true}
        lastActivity={yesterday}
        activeCall={null}
        onClick={fn()}
      />
    </div>
  ),
};

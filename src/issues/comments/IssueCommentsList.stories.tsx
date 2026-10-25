import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateTime } from 'luxon';

import { ENV } from '@/core/config';
import { ModalProvider } from '@/modal/ModalContext';

import { IssueCommentsContext } from './IssueCommentsContext';
import { IssueCommentsList } from './IssueCommentsList';
import { Comment } from './types';

const queryClient = new QueryClient();

ENV.plugins = {
  ...ENV.plugins,
  WALDUR_CORE: { TRANSLATION_DOMAIN: '' } as any,
  WALDUR_SUPPORT: { ACTIVE_BACKEND_TYPE: 'basic', ENABLED: true } as any,
};

const ago = (hours: number) => DateTime.now().minus({ hours }).toISO();

const mockComments: Comment[] = [
  {
    uuid: 'comment-1',
    author_name: 'Alice Andersen',
    author_email: 'alice@example.com',
    author_user: 'alice',
    author_uuid: 'user-alice-uuid',
    backend_id: 'jira-101',
    created: ago(2),
    description:
      'We have verified the customer request and adjusted the allocated storage quota.',
    is_public: true,
    issue: 'issue-1',
    issue_key: 'SUP-101',
    url: '/api/support-comments/1/',
    update_is_available: true,
    destroy_is_available: true,
  },
  {
    uuid: 'comment-2',
    author_name: 'Support Team',
    author_email: 'support@example.com',
    author_user: 'support',
    author_uuid: 'user-support-uuid',
    backend_id: 'jira-102',
    created: ago(24),
    description:
      'Internal note: Requested verification from the infrastructure team.',
    is_public: false,
    issue: 'issue-1',
    issue_key: 'SUP-101',
    url: '/api/support-comments/2/',
    update_is_available: false,
    destroy_is_available: false,
  },
  {
    uuid: 'comment-3',
    author_name: 'Bob Berg',
    author_email: 'bob@example.com',
    author_user: 'bob',
    author_uuid: 'user-bob-uuid',
    backend_id: 'jira-103',
    created: ago(48),
    description:
      'Hello, could you please increase our project storage quota by 2 TB?',
    is_public: true,
    issue: 'issue-1',
    issue_key: 'SUP-101',
    url: '/api/support-comments/3/',
    update_is_available: true,
    destroy_is_available: false,
  },
];

const meta: Meta = {
  title: 'Support/IssueCommentsList',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const mockIssue = { url: '/api/support-issues/1/' } as any;

export const Default: Story = {
  render: () => (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <IssueCommentsContext.Provider value={mockIssue}>
          <div className="max-w-2xl bg-primary p-6 rounded-lg border-[1px] border-secondary">
            <IssueCommentsList comments={mockComments} />
          </div>
        </IssueCommentsContext.Provider>
      </ModalProvider>
    </QueryClientProvider>
  ),
};

export const MobileViewport: Story = {
  globals: { viewport: 'mobile' },
  render: () => (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <IssueCommentsContext.Provider value={mockIssue}>
          <div className="w-[360px] max-w-full bg-primary p-4 rounded-lg border-[1px] border-secondary">
            <IssueCommentsList comments={mockComments} />
          </div>
        </IssueCommentsContext.Provider>
      </ModalProvider>
    </QueryClientProvider>
  ),
};

export const Empty: Story = {
  render: () => (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <IssueCommentsContext.Provider value={mockIssue}>
          <div className="max-w-2xl bg-primary p-6 rounded-lg border-[1px] border-secondary">
            <IssueCommentsList comments={[]} />
          </div>
        </IssueCommentsContext.Provider>
      </ModalProvider>
    </QueryClientProvider>
  ),
};

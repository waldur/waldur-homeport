import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memoryLocationPlugin, UIRouter, UIRouterReact } from '@uirouter/react';
import { FC, ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';

import { ModalProvider } from '@/modal/ModalContext';

import { TicketDraft } from './parseTicketDraft';
import { TicketDraftCard } from './TicketDraftCard';
import { ticketDraftQueryKey } from './useServerTicketDraft';

const inFuture = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const MOCK_DRAFT: TicketDraft = {
  draftUuid: 'draft-uuid-1',
  requester: '@alice:example.com',
  title: 'Storage allocation limit reached for VM instance',
  description:
    'Our batch job halted unexpectedly because the root disk reached 100% capacity.\n' +
    'Please extend volume volume-ssd-01 to 200GB.',
  requestType: 'Resource limit increase',
  priority: 'High',
  helpdesk: 'HPC Support Helpdesk',
  project: {
    uuid: 'proj-1',
    name: 'Genomics Research Lab',
    customerUuid: 'cust-1',
    customerName: 'BioMed Institute',
  },
  resource: {
    uuid: 'res-1',
    name: 'compute-node-gpu-04',
    offeringName: 'Cloud Compute',
  },
  expiresAt: inFuture(),
};

const serverData = {
  uuid: 'draft-uuid-1',
  state: 'pending',
  title: MOCK_DRAFT.title,
  description: MOCK_DRAFT.description,
  request_type: MOCK_DRAFT.requestType,
  priority: MOCK_DRAFT.priority,
  project_uuid: MOCK_DRAFT.project?.uuid,
  project_name: MOCK_DRAFT.project?.name,
  customer_uuid: MOCK_DRAFT.project?.customerUuid,
  customer_name: MOCK_DRAFT.project?.customerName,
  resource_uuid: MOCK_DRAFT.resource?.uuid,
  resource_name: MOCK_DRAFT.resource?.name,
  resource_offering_name: MOCK_DRAFT.resource?.offeringName,
  helpdesk: MOCK_DRAFT.helpdesk,
  expires_at: MOCK_DRAFT.expiresAt,
};

const StoryRouter: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useMemo(() => {
    const instance = new UIRouterReact();
    instance.plugin(memoryLocationPlugin);
    instance.stateRegistry.register({ name: 'home', url: '/' });
    instance.stateRegistry.register({
      name: 'support.detail',
      url: '/support/:issue_uuid',
    });
    return instance;
  }, []);

  return <UIRouter router={router}>{children}</UIRouter>;
};

const Harness: FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    client.setQueryData(
      ticketDraftQueryKey(null, MOCK_DRAFT.draftUuid),
      serverData,
    );
    return client;
  }, []);

  const store = useMemo(
    () =>
      configureStore()({
        workspace: { user: { uuid: 'alice-uuid' } },
      }),
    [],
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <StoryRouter>
            <div className="w-[440px] max-w-full bg-primary border border-secondary rounded-xl p-4 shadow-sm m-4">
              {children}
            </div>
          </StoryRouter>
        </ModalProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta<typeof TicketDraftCard> = {
  title: 'Matrix/TicketDraftCard',
  component: TicketDraftCard,
  parameters: {
    docs: {
      description: {
        component:
          'A support ticket draft proposed by the chat bot. Displays draft title, description, ' +
          'structured metadata facts, informational helpdesk notice, expiry countdown, and interactive actions ' +
          '(Create ticket, Edit, Cancel draft) for the requester, or read-only states for other members.',
      },
    },
  },
  args: {
    draft: MOCK_DRAFT,
    isRequester: true,
  },
  decorators: [
    (Story) => (
      <Harness>
        <Story />
      </Harness>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TicketDraftCard>;

export const PendingRequester: Story = {};

export const PendingNonRequester: Story = {
  args: {
    draft: MOCK_DRAFT,
    isRequester: false,
  },
};

export const CreatedOutcome: Story = {
  args: {
    draft: MOCK_DRAFT,
    isRequester: false,
    outcome: {
      state: 'created',
      issueKey: 'HD-1042',
      issueUuid: 'issue-1042-uuid',
    },
  },
};

export const CancelledOutcome: Story = {
  args: {
    draft: MOCK_DRAFT,
    isRequester: false,
    outcome: {
      state: 'cancelled',
    },
  },
};

export const ExpiredOutcome: Story = {
  args: {
    draft: MOCK_DRAFT,
    isRequester: false,
    outcome: {
      state: 'expired',
    },
  },
};

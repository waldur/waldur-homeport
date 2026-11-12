import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FC, ReactNode } from 'react';

import {
  AskUserFormBlock,
  BUTTON_GROUP_OPTION_LIMIT,
} from './AskUserFormBlock';
import { OfflineBlockContext } from './offlineBlockContext';

const StoryAssistantRuntime: FC<{ children: ReactNode }> = ({ children }) => {
  const runtime = useExternalStoreRuntime({
    isRunning: false,
    messages: [],
    convertMessage: (m) => m,
    onNew: async () => {},
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};

const StoryHarness: FC<{ children: ReactNode }> = ({ children }) => (
  <StoryAssistantRuntime>
    <div className="w-[720px] max-w-full bg-primary border border-secondary rounded-xl p-4 shadow-sm m-4">
      {children}
    </div>
  </StoryAssistantRuntime>
);

const meta: Meta<typeof AskUserFormBlock> = {
  title: 'AI Assistant/AskUserFormBlock',
  component: AskUserFormBlock,
  parameters: {
    docs: {
      description: {
        component:
          'Renders interactive user clarification and decision forms in the AI assistant conversation, ' +
          'supporting button groups (single/multi-select), searchable dropdowns, and freeform text answers.',
      },
    },
  },
  decorators: [
    (Story) => (
      <StoryHarness>
        <Story />
      </StoryHarness>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AskUserFormBlock>;

export const SingleSelectButtons: Story = {
  args: {
    block: {
      id: 'block-q1',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
      context: 'Please choose an environment for your newly requested service.',
      questions: [
        {
          id: 'q1',
          header: 'Environment',
          question: 'Which deployment environment should this instance target?',
          multiSelect: false,
          options: [
            {
              id: 'opt-dev',
              label: 'Development',
              description: 'Sandbox for active testing',
            },
            {
              id: 'opt-stage',
              label: 'Staging',
              description: 'Pre-production mirror',
            },
            {
              id: 'opt-prod',
              label: 'Production',
              description: 'High availability zone',
            },
          ],
        },
      ],
    },
  },
};

export const MultiSelectButtons: Story = {
  args: {
    block: {
      id: 'block-q2',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
      questions: [
        {
          id: 'q2',
          header: 'Add-ons',
          question: 'Select the additional services to enable:',
          multiSelect: true,
          options: [
            { id: 'opt-backup', label: 'Daily Automated Backups' },
            { id: 'opt-monitoring', label: 'Prometheus Metrics Exporter' },
            { id: 'opt-firewall', label: 'Managed Web Application Firewall' },
            { id: 'opt-vpn', label: 'Dedicated WireGuard VPN Gateway' },
          ],
        },
      ],
    },
  },
};

export const SearchableList: Story = {
  args: {
    block: {
      id: 'block-q3',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
      context:
        'When there are more than 8 options, the form automatically upgrades to a searchable select.',
      questions: [
        {
          id: 'q3',
          header: 'Region',
          question: 'Select the primary cloud data center region:',
          options: Array.from(
            { length: BUTTON_GROUP_OPTION_LIMIT + 4 },
            (_, i) => ({
              id: `region-${i + 1}`,
              label: `Region ${i + 1} (${['Tallinn', 'Tartu', 'Helsinki', 'Frankfurt', 'Stockholm', 'Oslo'][i % 6]} Zone ${Math.floor(i / 6) + 1})`,
              description: `Zone dc-${i + 1}`,
            }),
          ),
        },
      ],
    },
  },
};

export const Freeform: Story = {
  args: {
    block: {
      id: 'block-q4',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
      questions: [
        {
          id: 'q4',
          header: 'Hostname',
          question:
            'What custom domain or hostname would you like to assign to this host?',
        },
      ],
    },
  },
};

export const MultipleQuestions: Story = {
  args: {
    block: {
      id: 'block-multi',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
      context: 'Clarifying details required before provisioning the resource.',
      questions: [
        {
          id: 'mq1',
          header: 'Tier',
          question: 'Select service tier:',
          multiSelect: false,
          options: [
            { id: 't-basic', label: 'Basic' },
            { id: 't-standard', label: 'Standard' },
            { id: 't-premium', label: 'Premium' },
          ],
        },
        {
          id: 'mq2',
          header: 'Features',
          question: 'Select feature flags:',
          multiSelect: true,
          options: [
            { id: 'f-tls', label: 'Automatic TLS Certificates' },
            { id: 'f-cdn', label: 'Edge Caching / CDN' },
          ],
        },
        {
          id: 'mq3',
          header: 'Notes',
          question: 'Any special instructions or tags for this deployment?',
        },
      ],
    },
  },
};

export const ReadOnlyLogView: Story = {
  decorators: [
    (Story) => (
      <OfflineBlockContext.Provider value={true}>
        <StoryHarness>
          <Story />
        </StoryHarness>
      </OfflineBlockContext.Provider>
    ),
  ],
  args: {
    block: {
      id: 'block-readonly',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
      context: 'Viewing historical response from chat audit logs.',
      questions: [
        {
          id: 'ro1',
          header: 'Environment',
          question: 'Which deployment environment should this instance target?',
          options: [
            { id: 'opt-dev', label: 'Development' },
            { id: 'opt-stage', label: 'Staging' },
            { id: 'opt-prod', label: 'Production' },
          ],
        },
      ],
    },
  },
};

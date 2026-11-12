import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { memoryLocationPlugin, UIRouter, UIRouterReact } from '@uirouter/react';
import { FC, ReactNode, useMemo } from 'react';

import { UIBlock } from '@/ai-assistant/lib/types';

import {
  VMOrderActions,
  VMOrderBlock,
  VMOrderFormProvider,
} from './VMOrderBlock';

const StoryRouter: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useMemo(() => {
    const instance = new UIRouterReact();
    instance.plugin(memoryLocationPlugin);
    instance.stateRegistry.register({ name: 'home', url: '/' });
    instance.stateRegistry.register({
      name: 'marketplace-orders.details',
      url: '/orders/:order_uuid',
    });
    return instance;
  }, []);

  return <UIRouter router={router}>{children}</UIRouter>;
};

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
  <StoryRouter>
    <StoryAssistantRuntime>
      <VMOrderFormProvider>
        <div className="w-[520px] max-w-full bg-primary border border-secondary rounded-xl p-4 shadow-sm m-4">
          {children}
        </div>
      </VMOrderFormProvider>
    </StoryAssistantRuntime>
  </StoryRouter>
);

const meta: Meta<typeof VMOrderBlock> = {
  title: 'AI Assistant/VMOrderBlock',
  component: VMOrderBlock,
  parameters: {
    docs: {
      description: {
        component:
          'Renders VM order creation steps in the AI assistant conversation, ' +
          'including preview confirmation, flavor/image selection forms, ' +
          'project/offering selectors, loading skeleton, success, and error states.',
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
  render: (args) => (
    <div>
      <VMOrderBlock {...args} />
      <VMOrderActions {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof VMOrderBlock>;

const BASE_BLOCK: UIBlock = {
  id: 'block-1',
  key: 'vm_order',
  content: '',
  status: 'complete',
  name: 'prod-web-server-01',
  project: 'Web Infrastructure',
  organization: 'Acme Cloud',
  flavor: 'm1.medium (2 vCPU, 4GB RAM)',
  image: 'Ubuntu 22.04 LTS',
  network: 'prod-internal-net',
  ssh_key_name: 'prod-deployer-key',
  system_volume_size: 50,
};

export const Preview: Story = {
  args: {
    block: BASE_BLOCK,
  },
};

export const Form: Story = {
  args: {
    block: {
      id: 'block-form-1',
      key: 'vm_order',
      content: '',
      status: 'complete',
      order_status: 'form',
      flavors: [
        { name: 'm1.small', cores: 1, ram: 2048 },
        { name: 'm1.medium', cores: 2, ram: 4096 },
        { name: 'm1.large', cores: 4, ram: 8192 },
        { name: 'c1.xlarge', cores: 8, ram: 16384 },
      ],
      images: [
        { name: 'Ubuntu 22.04 LTS', min_disk: 20, min_ram: 2048 },
        { name: 'Debian 12 Bookworm', min_disk: 10, min_ram: 1024 },
        { name: 'Rocky Linux 9', min_disk: 20, min_ram: 2048 },
        { name: 'CentOS Stream 9', min_disk: 20, min_ram: 2048 },
      ],
    },
  },
};

export const ProjectForm: Story = {
  args: {
    block: {
      id: 'block-project-1',
      key: 'vm_order',
      content: '',
      status: 'complete',
      order_status: 'project_form',
      projects: [
        {
          uuid: 'proj-1',
          name: 'Web Infrastructure',
          organization: 'Acme Cloud',
        },
        {
          uuid: 'proj-2',
          name: 'Data Pipeline',
          organization: 'Acme Analytics',
        },
        {
          uuid: 'proj-3',
          name: 'Staging Environment',
          organization: 'Acme Cloud',
        },
      ],
    },
  },
};

export const OfferingForm: Story = {
  args: {
    block: {
      id: 'block-offering-1',
      key: 'vm_order',
      content: '',
      status: 'complete',
      order_status: 'offering_form',
      offerings: [
        { uuid: 'off-1', name: 'Standard Virtual Machine (OpenStack)' },
        { uuid: 'off-2', name: 'High-Performance Computing VM' },
        { uuid: 'off-3', name: 'GPU-Accelerated Compute Instance' },
      ],
    },
  },
};

export const Success: Story = {
  args: {
    block: {
      ...BASE_BLOCK,
      id: 'block-success-1',
      order_status: 'success',
      order_id: '550e8400-e29b-41d4-a716-446655440000',
    },
  },
};

export const ErrorState: Story = {
  args: {
    block: {
      ...BASE_BLOCK,
      id: 'block-error-1',
      order_status: 'error',
      error:
        'Quota exceeded: Project "Web Infrastructure" has reached its limit of 10 vCPUs.',
    },
  },
};

export const Loading: Story = {
  args: {
    block: {
      id: 'block-loading-1',
      key: 'vm_order',
      content: '',
      status: 'loading',
    },
  },
};

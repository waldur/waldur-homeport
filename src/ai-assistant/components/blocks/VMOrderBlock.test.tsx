import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';
import { useNotify } from '@/store/notify';

import {
  VMOrderActions,
  VMOrderBlock,
  VMOrderFormProvider,
} from './VMOrderBlock';

vi.mock('@assistant-ui/react', () => ({
  ThreadPrimitive: {
    Suggestion: ({ children }: any) => <>{children}</>,
  },
}));

vi.mock('@/core/Link', () => ({
  Link: ({ children, params, state }: any) => (
    <a href="#test" data-state={state} data-params={JSON.stringify(params)}>
      {children}
    </a>
  ),
}));

vi.mock('@/core/CopyToClipboardButton', () => ({
  CopyToClipboardButton: ({ value }: { value: string }) => (
    <button type="button" aria-label="Copy" data-copy-value={value}>
      Copy
    </button>
  ),
}));

const mockBlock = (fields: Partial<UIBlock>): UIBlock => ({
  id: 'b1',
  key: 'vm_order',
  content: '',
  status: 'complete',
  ...fields,
});

describe('VMOrderBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a skeleton loader when block is loading', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock block={mockBlock({ status: 'loading' })} />
      </VMOrderFormProvider>,
    );

    expect(screen.queryByText('VM')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders preview mode with VM details and confirmation prompt', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            name: 'my-test-vm',
            project: 'Test Project',
            organization: 'Test Org',
            flavor: 'm1.medium',
            image: 'Ubuntu 22.04',
            network: 'public-net',
            ssh_key_name: 'my-ssh-key',
            system_volume_size: 40,
          })}
        />
        <VMOrderActions
          block={mockBlock({
            name: 'my-test-vm',
            project: 'Test Project',
            organization: 'Test Org',
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(
      screen.getByText('Here is the preview of changes:'),
    ).toBeInTheDocument();
    expect(screen.getByText('my-test-vm')).toBeInTheDocument();
    expect(screen.getByText('MT')).toBeInTheDocument(); // Initials
    expect(screen.getByText('Project: Test Project')).toBeInTheDocument();
    expect(screen.getByText('Organization: Test Org')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('m1.medium')).toBeInTheDocument();
    expect(screen.getByText('OS')).toBeInTheDocument();
    expect(screen.getByText('Ubuntu 22.04')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('public-net')).toBeInTheDocument();
    expect(screen.getByText('SSH Key')).toBeInTheDocument();
    expect(screen.getByText('my-ssh-key')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('40 GB')).toBeInTheDocument();
    expect(
      screen.getByText('Do you confirm these changes?'),
    ).toBeInTheDocument();

    // Action buttons
    expect(screen.getByRole('button', { name: /Modify/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  it('renders form mode for flavor and image selection', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            order_status: 'form',
            name: 'staging-vm',
            project: 'Test Project',
            organization: 'Test Org',
            flavors: [
              { name: 'small', cores: 1, ram: 2048 },
              { name: 'medium', cores: 2, ram: 4096 },
            ],
            images: [
              { name: 'Debian 12', min_disk: 10, min_ram: 1024 },
              { name: 'Ubuntu 24.04', min_disk: 20, min_ram: 2048 },
            ],
          })}
        />
        <VMOrderActions
          block={mockBlock({
            order_status: 'form',
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(
      screen.getByText('Please select a flavor and image for your VM.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Configure your VM:')).toBeInTheDocument();
    expect(screen.getByText('VM Size')).toBeInTheDocument();
    expect(screen.getByText('Operating System')).toBeInTheDocument();

    // Modify is available; Continue is disabled until selections are made
    expect(screen.getByRole('button', { name: /Modify/i })).toBeInTheDocument();
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('renders warning alert in form mode when flavors or images are missing', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            order_status: 'form',
            name: 'staging-vm',
            flavors: [],
            images: [],
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(
      screen.getByText('No flavors or images available.'),
    ).toBeInTheDocument();
  });

  it('renders project selection form in project_form mode', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            order_status: 'project_form',
            projects: [
              { uuid: 'p-1', name: 'Alpha', organization: 'Org A' },
              { uuid: 'p-2', name: 'Beta', organization: 'Org B' },
            ],
          })}
        />
        <VMOrderActions
          block={mockBlock({
            order_status: 'project_form',
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(
      screen.getByText('Please select a project to create your VM in.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('renders cloud provider selection form in offering_form mode', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            order_status: 'offering_form',
            offerings: [
              { uuid: 'off-1', name: 'OpenStack Riga' },
              { uuid: 'off-2', name: 'OpenStack Tallinn' },
            ],
          })}
        />
        <VMOrderActions
          block={mockBlock({
            order_status: 'offering_form',
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(
      screen.getByText('Please select a cloud provider for your VM.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cloud provider')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('renders success state with order ID and notifies user', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            order_status: 'success',
            order_id: 'order-uuid-1234',
            name: 'prod-vm',
            project: 'Prod Project',
            message: 'Your VM has been provisioned.',
          })}
        />
        <VMOrderActions
          block={mockBlock({
            order_status: 'success',
            order_id: 'order-uuid-1234',
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(
      screen.getByText('VM order created successfully!'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your VM has been provisioned.'),
    ).toBeInTheDocument();
    expect(screen.getByText('order-uuid-1234')).toBeInTheDocument();
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Operation completed successfully',
    );

    // Actions footer returns null in success state
    expect(
      screen.queryByRole('button', { name: /Create/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Modify/i }),
    ).not.toBeInTheDocument();
  });

  it('renders error state when VM creation failed', () => {
    render(
      <VMOrderFormProvider>
        <VMOrderBlock
          block={mockBlock({
            order_status: 'error',
            error: 'Quota limit exceeded: insufficient RAM',
          })}
        />
        <VMOrderActions
          block={mockBlock({
            order_status: 'error',
            error: 'Quota limit exceeded: insufficient RAM',
          })}
        />
      </VMOrderFormProvider>,
    );

    expect(screen.getByText('VM Creation Failed')).toBeInTheDocument();
    expect(
      screen.getByText('Quota limit exceeded: insufficient RAM'),
    ).toBeInTheDocument();

    // Actions footer returns null in error state
    expect(
      screen.queryByRole('button', { name: /Create/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Modify/i }),
    ).not.toBeInTheDocument();
  });
});

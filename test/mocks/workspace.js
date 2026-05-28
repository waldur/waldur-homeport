import { vi } from 'vitest';

const mockWorkspaceHooks = {
  useUser: vi.fn().mockReturnValue({}),
  useCustomer: vi.fn().mockReturnValue({}),
  useProject: vi.fn().mockReturnValue({}),
  useSetUser: vi.fn().mockReturnValue(vi.fn()),
  useSetCustomer: vi.fn().mockReturnValue(vi.fn()),
  useSetProject: vi.fn().mockReturnValue(vi.fn()),
};

vi.mock('@/workspace/hooks', () => ({
  useUser: mockWorkspaceHooks.useUser,
  useCustomer: mockWorkspaceHooks.useCustomer,
  useProject: mockWorkspaceHooks.useProject,
  useSetUser: mockWorkspaceHooks.useSetUser,
  useSetCustomer: mockWorkspaceHooks.useSetCustomer,
  useSetProject: mockWorkspaceHooks.useSetProject,
}));

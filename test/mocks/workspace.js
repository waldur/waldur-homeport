import { vi } from 'vitest';

const mockWorkspaceHooks = {
  useUser: vi.fn().mockReturnValue({}),
  useImpersonatorUser: vi.fn().mockReturnValue(undefined),
  useCustomer: vi.fn().mockReturnValue({}),
  useProject: vi.fn().mockReturnValue({}),
  useSetUser: vi.fn().mockReturnValue(vi.fn()),
  useSetCustomer: vi.fn().mockReturnValue(vi.fn()),
  useSetProject: vi.fn().mockReturnValue(vi.fn()),
};

vi.mock('@/workspace/hooks', () => ({
  useUser: mockWorkspaceHooks.useUser,
  useImpersonatorUser: mockWorkspaceHooks.useImpersonatorUser,
  useCustomer: mockWorkspaceHooks.useCustomer,
  useProject: mockWorkspaceHooks.useProject,
  useSetUser: mockWorkspaceHooks.useSetUser,
  useSetCustomer: mockWorkspaceHooks.useSetCustomer,
  useSetProject: mockWorkspaceHooks.useSetProject,
}));

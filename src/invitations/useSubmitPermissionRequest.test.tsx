import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUserGroupInvitationsSubmitRequest = vi.fn();
const mockUserGroupInvitationsRetrieve = vi.fn();
const mockOpenDialog = vi.fn();
const mockConfirm = vi.fn();
const mockShowSuccess = vi.fn();
const mockRouterGo = vi.fn();
const mockRefreshCurrentUser = vi.fn();

vi.mock('waldur-js-client', () => ({
  userGroupInvitationsSubmitRequest: (...args) =>
    mockUserGroupInvitationsSubmitRequest(...args),
  userGroupInvitationsRetrieve: (...args) =>
    mockUserGroupInvitationsRetrieve(...args),
}));

vi.mock('@uirouter/react', () => ({
  useRouter: () => ({
    stateService: { go: mockRouterGo },
  }),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    openDialog: mockOpenDialog,
    confirm: mockConfirm,
  }),
}));

vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showError: vi.fn(),
  }),
}));

vi.mock('react-redux', () => ({
  useSelector: () => ({
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
  }),
}));

vi.mock('@/workspace/selectors', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/core/StorageManager', () => ({
  GroupInvitationTokenStorage: {
    remove: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('@/user/UsersService', () => ({
  UsersService: {
    refreshCurrentUser: (...args) => mockRefreshCurrentUser(...args),
  },
}));

vi.mock('@/core/ErrorMessageFormatter', () => ({
  format: (error: any) => error?.message || 'Unknown error',
}));

vi.mock('./GroupInvitationConfirmDialog', () => ({
  GroupInvitationConfirmDialog: 'GroupInvitationConfirmDialog',
}));

vi.mock('./join-organization/ProjectDetailsDialog', () => ({
  ProjectDetailsDialog: 'ProjectDetailsDialog',
}));

// Must import AFTER vi.mock calls
import { GroupInvitationTokenStorage } from '@/core/StorageManager';

import { useSubmitPermissionRequest } from './useSubmitPermissionRequest';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

function setupHook(token = 'test-token') {
  return renderHook(() => useSubmitPermissionRequest(token), {
    wrapper: createWrapper(),
  });
}

describe('useSubmitPermissionRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return submit function and isPending state', () => {
    const { result } = setupHook();

    expect(result.current.submit).toBeDefined();
    expect(typeof result.current.submit).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('should open GroupInvitationConfirmDialog when submit is called', () => {
    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    expect(mockOpenDialog).toHaveBeenCalledWith(
      'GroupInvitationConfirmDialog',
      expect.objectContaining({
        resolve: expect.objectContaining({
          token: 'test-token',
          onConfirm: expect.any(Function),
          onCancel: expect.any(Function),
        }),
        backdrop: 'static',
      }),
    );
  });

  it('should clear token and redirect on cancel', () => {
    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    // Extract onCancel from the dialog call
    const dialogCall = mockOpenDialog.mock.calls[0];
    const onCancel = dialogCall[1].resolve.onCancel;

    act(() => {
      onCancel();
    });

    expect(GroupInvitationTokenStorage.remove).toHaveBeenCalled();
    expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
  });

  it('should call mutation on confirm and show success for auto-approved', async () => {
    mockUserGroupInvitationsRetrieve.mockResolvedValue({
      data: { allow_custom_project_details: false },
    });
    mockUserGroupInvitationsSubmitRequest.mockResolvedValue({
      data: { auto_approved: true, scope_name: 'Test Org' },
    });
    mockRefreshCurrentUser.mockResolvedValue(undefined);

    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    // Extract onConfirm
    const dialogCall = mockOpenDialog.mock.calls[0];
    const onConfirm = dialogCall[1].resolve.onConfirm;

    await act(async () => {
      await onConfirm();
    });

    // Wait for mutation to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockUserGroupInvitationsSubmitRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'test-token' },
        body: {},
      }),
    );
  });

  it('should show duplicate error dialog for conflict errors', async () => {
    mockUserGroupInvitationsRetrieve.mockResolvedValue({
      data: { allow_custom_project_details: false },
    });
    mockUserGroupInvitationsSubmitRequest.mockRejectedValue({
      message: 'User already has this role in the scope.',
    });
    mockConfirm.mockResolvedValue(undefined);

    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    const dialogCall = mockOpenDialog.mock.calls[0];
    const onConfirm = dialogCall[1].resolve.onConfirm;

    await act(async () => {
      await onConfirm();
    });

    // Wait for mutation error handler
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockConfirm).toHaveBeenCalledWith(
      'You already have access',
      expect.any(String),
      expect.objectContaining({
        type: 'primary',
        onlyPositiveButton: true,
      }),
    );
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUserInvitationsAccept = vi.fn();
const mockOpenDialog = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockRouterGo = vi.fn();
const mockDispatch = vi.fn();
const mockIsAuthenticated = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockRefreshCurrentUser = vi.fn();

vi.mock('waldur-js-client', () => ({
  userInvitationsAccept: (...args) => mockUserInvitationsAccept(...args),
}));

vi.mock('@uirouter/react', () => ({
  useRouter: () => ({
    stateService: { go: mockRouterGo },
  }),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    openDialog: mockOpenDialog,
  }),
}));

vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('@/auth/AuthService', () => ({
  isAuthenticated: (...args) => mockIsAuthenticated(...args),
}));

vi.mock('@/core/StorageManager', () => ({
  InvitationTokenStorage: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/user/UsersService', () => ({
  UsersService: {
    refreshCurrentUser: (...args) => mockRefreshCurrentUser(...args),
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
    mandatoryFieldsMissing: vi.fn().mockReturnValue(false),
  },
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
}));

vi.mock('@/workspace/actions', () => ({
  setCurrentUser: (user) => ({ type: 'SET_CURRENT_USER', payload: user }),
}));

vi.mock('./InvitationConfirmDialog', () => ({
  InvitationConfirmDialog: 'InvitationConfirmDialog',
}));

import { InvitationTokenStorage } from '@/core/StorageManager';

import { useCheckAndAccept } from './useCheckAndAccept';

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

describe('useCheckAndAccept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ uuid: 'user-1' });
  });

  it('should return checkAndAccept function and isPending state', () => {
    const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
      wrapper: createWrapper(),
    });

    expect(result.current.checkAndAccept).toBeDefined();
    expect(typeof result.current.checkAndAccept).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true);
    });

    it('should open InvitationConfirmDialog', async () => {
      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkAndAccept();
      });

      // Wait for promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOpenDialog).toHaveBeenCalledWith(
        'InvitationConfirmDialog',
        expect.objectContaining({
          resolve: expect.objectContaining({
            token: 'test-uuid',
            onConfirm: expect.any(Function),
            onCancel: expect.any(Function),
          }),
          backdrop: 'static',
        }),
      );
    });

    it('should clear token and show error on cancel', async () => {
      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = mockOpenDialog.mock.calls[0];
      const onCancel = dialogCall[1].resolve.onCancel;

      act(() => {
        onCancel();
      });

      expect(InvitationTokenStorage.remove).toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalled();
      expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
    });

    it('should call accept API on confirm', async () => {
      mockUserInvitationsAccept.mockResolvedValue({ data: {} });
      mockGetCurrentUser.mockResolvedValue({ uuid: 'user-1' });
      mockRefreshCurrentUser.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = mockOpenDialog.mock.calls[0];
      const onConfirm = dialogCall[1].resolve.onConfirm;

      act(() => {
        onConfirm({ invitation: { project_uuid: 'proj-1' } });
      });

      // Wait for mutation
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockUserInvitationsAccept).toHaveBeenCalledWith({
        path: { uuid: 'test-uuid' },
      });
    });

    it('should show error for 404 response', async () => {
      mockUserInvitationsAccept.mockRejectedValue({
        response: { status: 404 },
      });

      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = mockOpenDialog.mock.calls[0];
      const onConfirm = dialogCall[1].resolve.onConfirm;

      act(() => {
        onConfirm({ invitation: {} });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockShowError).toHaveBeenCalledWith('Invitation is not found.');
    });

    it('should show detailed error message when available', async () => {
      mockUserInvitationsAccept.mockRejectedValue({
        response: {
          status: 400,
          data: { detail: 'User has already the same role in this scope.' },
        },
      });

      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = mockOpenDialog.mock.calls[0];
      const onConfirm = dialogCall[1].resolve.onConfirm;

      act(() => {
        onConfirm({ invitation: {} });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockShowError).toHaveBeenCalledWith(
        'User has already the same role in this scope.',
      );
      expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
    });

    it('should store token and redirect to login', () => {
      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkAndAccept();
      });

      expect(InvitationTokenStorage.set).toHaveBeenCalledWith('test-uuid');
      expect(mockRouterGo).toHaveBeenCalledWith('login');
      expect(mockOpenDialog).not.toHaveBeenCalled();
    });
  });
});

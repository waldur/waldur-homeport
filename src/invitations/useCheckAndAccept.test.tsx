/* eslint-disable import/order */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userInvitationsAccept } from 'waldur-js-client';
import { InvitationTokenStorage } from '@/core/StorageManager';
import { useModal } from '@/modal/actions';

import { router } from '@/router';

const mockIsAuthenticated = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockRefreshCurrentUser = vi.fn();

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

vi.mock('./InvitationConfirmDialog', () => ({
  InvitationConfirmDialog: 'InvitationConfirmDialog',
}));

import { useNotify } from '@/store/notify';
import { createTestWrapper } from '@/test/harness';

import { useCheckAndAccept } from './useCheckAndAccept';

describe('useCheckAndAccept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ uuid: 'user-1' });
  });

  it('should return checkAndAccept function and isPending state', () => {
    const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
      wrapper: createTestWrapper().wrapper,
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
        wrapper: createTestWrapper().wrapper,
      });

      act(() => {
        result.current.checkAndAccept();
      });

      // Wait for promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(useModal().openDialog)).toHaveBeenCalledWith(
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
        wrapper: createTestWrapper().wrapper,
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
      const onCancel = dialogCall[1].resolve.onCancel;

      act(() => {
        onCancel();
      });

      expect(InvitationTokenStorage.remove).toHaveBeenCalled();
      expect(useNotify().showError).toHaveBeenCalled();
      expect(router.stateService.go).toHaveBeenCalledWith('profile.details');
    });

    it('should call accept API on confirm', async () => {
      vi.mocked(userInvitationsAccept).mockResolvedValue({ data: {} } as any);
      mockGetCurrentUser.mockResolvedValue({ uuid: 'user-1' });
      mockRefreshCurrentUser.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createTestWrapper().wrapper,
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
      const onConfirm = dialogCall[1].resolve.onConfirm;

      act(() => {
        onConfirm({ invitation: { project_uuid: 'proj-1' } });
      });

      // Wait for mutation
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(userInvitationsAccept).toHaveBeenCalledWith({
        path: { uuid: 'test-uuid' },
      });
    });

    it('should show error for 404 response', async () => {
      vi.mocked(userInvitationsAccept).mockRejectedValue({
        response: { status: 404 },
      });

      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createTestWrapper().wrapper,
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
      const onConfirm = dialogCall[1].resolve.onConfirm;

      act(() => {
        onConfirm({ invitation: {} });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(useNotify().showError).toHaveBeenCalledWith(
        'Invitation is not found.',
      );
    });

    it('should show detailed error message when available', async () => {
      vi.mocked(userInvitationsAccept).mockRejectedValue({
        response: {
          status: 400,
          data: { detail: 'User has already the same role in this scope.' },
        },
      });

      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createTestWrapper().wrapper,
      });

      act(() => {
        result.current.checkAndAccept();
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
      const onConfirm = dialogCall[1].resolve.onConfirm;

      act(() => {
        onConfirm({ invitation: {} });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(useNotify().showError).toHaveBeenCalledWith(
        'User has already the same role in this scope.',
      );
      expect(router.stateService.go).toHaveBeenCalledWith('profile.details');
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
    });

    it('should store token and redirect to login', () => {
      const { result } = renderHook(() => useCheckAndAccept('test-uuid'), {
        wrapper: createTestWrapper().wrapper,
      });

      act(() => {
        result.current.checkAndAccept();
      });

      expect(InvitationTokenStorage.set).toHaveBeenCalledWith('test-uuid');
      expect(router.stateService.go).toHaveBeenCalledWith('login');
      expect(vi.mocked(useModal().openDialog)).not.toHaveBeenCalled();
    });
  });
});
